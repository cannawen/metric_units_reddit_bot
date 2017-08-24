const deasync = require('deasync');
const fs = require('fs');
const path = require('path');
const request = require('request');

const helper = require('./helper');
const environment = helper.environment();

var oauthAccessToken = undefined;
var oauthTokenValidUntil = undefined;
var lastProcessedCommentTimestamp = 0;

function get(url) {
  let content;  

  if (url.startsWith('http')) {
    content = networkRequest({ url: url }, false);
  } else {
    content = networkRequest({ url: 'https://oauth.reddit.com' + url }, true)
  }

  return content['data']['children'];
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

  const banned = messages
    .filter(data => data['kind'] === 't4')
    .map(data => data['data'])
    .filter(m => m['subject'].match(/^You\'ve been banned from participating in r\/(.+)$/i))
    
    banned
      .map (b => b['subject'].match(/^You\'ve been banned from participating in r\/(.+)$/i)[1])
      .forEach(b => helper.log("- " + b))
    
    const id = messages[messages.length - 1]['data']['name'];

    messages = get("/message/inbox?limit=100&after=" + id)
  }
}

function getRedditComments(subreddit) {
  let content = get("https://www.reddit.com/r/" + subreddit + "/comments.json?limit=100");

  const unprocessedComments = content
    .map(comment => comment['data'])
    .filter(data => data['created_utc'] > lastProcessedCommentTimestamp)
    .map(data => {
      return {
          'body': data['body'],
          'author': data['author'],
          'id': data['name'],
          'link': data['link_permalink'] + data['id'],
          'subreddit': data['subreddit'],
          'timestamp' : data['created_utc']
        }
    });

  lastProcessedCommentTimestamp = content[0]['data']['created_utc'];
  return unprocessedComments;
}

function postComment(parentId, markdownBody) {
  post('/api/comment', { 'parent' : parentId, 'text' : markdownBody });
}

function getUnreadMessages() {
  return get("/message/unread");
}

function markAllMessagesAsRead() {
  post('/api/read_all_messages');
}

function filterCommentReplies(messages) {
  return messages
    .filter(raw => raw['kind'] === 't1')
    .map(raw => raw['data'])
    .map(data => {
      return {
        'body': data['body'],
        'id': data['name'],
        'submission': data['link_title'],
        'link': 'https://www.reddit.com' + data['context'],
        'timestamp' : data['created_utc'],
        'subreddit' : data['subreddit']
      }
    });
}

function filterPrivateMessages(messages) {
  return messages
    .filter(raw => raw['kind'] === 't4')
    .map(raw => raw['data'])
    .map(data => {
      return {
        'body' : data['body'],
        'subject' : data['subject'],
        'id' : data['name'],
        'username' : data['author'],
        'timestamp' : data['created_utc']
      }
    });
}

module.exports = {
  "refreshToken" : refreshToken,
  "getRedditComments" : getRedditComments,
  "postComment" : postComment,
  "getUnreadMessages" : getUnreadMessages,
  "markAllMessagesAsRead" : markAllMessagesAsRead,
  "filterCommentReplies" : filterCommentReplies,
  "filterPrivateMessages" : filterPrivateMessages
}
