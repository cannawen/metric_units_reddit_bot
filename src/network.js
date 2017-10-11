const deasync = require('deasync');
const fs = require('fs');
const path = require('path');
const request = require('request');

const helper = require('./helper');
const environment = helper.environment();

var oauthAccessToken = undefined;
var oauthTokenValidUntil = undefined;
var lastProcessedCommentId = undefined;

function get(url) {
  let content;

  if (url.startsWith('http')) {
    content = networkRequest({ url: url }, false);
  } else {
    content = networkRequest({ url: 'https://oauth.reddit.com' + url }, true)
  }

  try {
    return content['data']['children'];
  } catch (e) {
    return content;
  }
}

function post(urlPath, form) {
  if (environment['dev-mode']) {
    helper.log(urlPath, form);
    return;
  }

  return networkRequest({
    url: 'https://oauth.reddit.com' + urlPath,
    method: 'POST',
    form: form
  }, true);
}

function networkRequest(options, oauthRequest) {
  function redditOauthHeader() {
    const userAgent =
     "script:" + environment['reddit-username'] + ":" + environment['version']
      + " (by: /u/" + environment['reddit-username'] + ")";

    return {
      headers: {
        'User-Agent': userAgent
      },
      auth: {
        'bearer': oauthAccessToken
      },
    }
  }

  var content = null;

  if (oauthRequest) {
    options = Object.assign(redditOauthHeader(), options);
  }

  request(options, function(err, res) {
    if (err) {
      console.error("network error:", err);
      content = undefined;
      oauthTokenValidUntil = 0;
      return;
    }
    try {
      content = JSON.parse(res.body);
    } catch (e) {
      content = undefined;
    }
  });

  while (content === null) {
    deasync.sleep(50);
  }
  return content;
}

function refreshToken() {
  if (helper.now() < oauthTokenValidUntil) {
    return;
  }

  var done = false;

  request({
    url: 'https://www.reddit.com/api/v1/access_token',
    method: 'POST',
    auth: {
      user: environment['oauth-username'],
      pass: environment['oauth-secret']
    },
    form: {
      'grant_type': 'password',
      'username': environment['reddit-username'],
      'password': environment['reddit-password']
    }
  }, function(err, res) {
    try {
      var json = JSON.parse(res.body);
      oauthAccessToken = json.access_token;
      oauthTokenValidUntil = helper.now() + 55*60*1000;
      done = true;
    } catch (e) {
      console.error("oauth error:", e)
      oauthTokenValidUntil = 0;
      done = true;
    }
  });

  while (!done) {
    deasync.sleep(100);
  }
}

//Utility to generate excluded subreddits yaml
function printBannedSubreddits() {
  let messages = get("/message/inbox?limit=100")
  while (messages.length > 0) {
    messages
      .filter(data => data['kind'] === 't4')
      .map(data => data['data'])
      .map (message => message['subject'].match(/^You\'ve been banned from participating in r\/(.+)$/i))
      .filter(match => match !== null)
      .map(match => match[1])
      .forEach(subreddit => helper.log("- " + subreddit));

    const lastMessageId = messages[messages.length - 1]['data']['name'];

    messages = get("/message/inbox?limit=100&after=" + lastMessageId)
  }
}

function getRedditComments(subreddit) {
  let content = get("https://www.reddit.com/r/" + subreddit + "/comments.json?limit=100&raw_json=1");
  if (!content) {
    return;
  }

  let comments = content;

  const lastProcessedIndex = comments.findIndex((el) => el['data']['name'] === lastProcessedCommentId);
  if (lastProcessedIndex !== -1) {
    comments = comments.slice(0, lastProcessedIndex)
  }

  const unprocessedComments = comments
    .map(comment => comment['data'])
    .map(data => {
      return {
          'body': data['body'],
          'author': data['author'],
          'id': data['name'],
          'postTitle': data['link_title'],
          'link': data['link_permalink'] + data['id'],
          'subreddit': data['subreddit'],
          'timestamp' : data['created_utc']
        }
    });

  lastProcessedCommentId = content[0]['data']['name'];
  return unprocessedComments;
}

function postComment(parentId, markdownBody) {
  post('/api/comment', { 'parent' : parentId, 'text' : markdownBody });
}

function getComment(commentId) {
  const comment = get('https://www.reddit.com/api/info.json?id=' + commentId);

  if (comment.length == 0) {
    return;
  }

  const data = comment[0]['data'];

  return {
    'body': data['body'],
    'author': data['author'],
    'id': data['name'],
    'link_id' : data['link_id'],
    'postTitle': '', // api/info does not return a value for postTitle but this property is required by shouldConvertComment
    'subreddit': data['subreddit'],
    'timestamp' : data['created_utc']
  }
}

function editComment(commentId, markdownBody) {
  post('/api/editusertext', { 'thing_id' : commentId, 'text' : markdownBody });
}

function getCommentReplies(linkId, commentId) {
  const replies = get('https://www.reddit.com/api/morechildren.json?api_type=json&link_id=' + linkId + '&children=' + commentId.replace(/t1_/g, ''));
  
  if (! replies.length === 0) {
    return null;
  }
  
  return replies['json']['data']['things'];
}

function getUnreadMessages() {
  return get("/message/unread?limit=100");
}

function markAllMessagesAsRead() {
  post('/api/read_all_messages');
}

function blockAuthorOfMessageWithId(id) {
  post("/api/block", { 'id' : id });
}

module.exports = {
  "refreshToken" : refreshToken,
  "getRedditComments" : getRedditComments,
  "getComment" : getComment,
  "postComment" : postComment,
  "editComment" : editComment,
  "getCommentReplies" : getCommentReplies,
  "getUnreadMessages" : getUnreadMessages,
  "markAllMessagesAsRead" : markAllMessagesAsRead,
  "blockAuthorOfMessageWithId" : blockAuthorOfMessageWithId
}
