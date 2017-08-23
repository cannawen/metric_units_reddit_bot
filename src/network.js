const deasync = require('deasync');
const fs = require('fs');
const path = require('path');
const request = require('request');

const helper = require('./helper');
const environment = helper.environment();

var oauthAccessToken = undefined;
var oauthTokenValidUntil = undefined;
var lastProcessedCommentTimestamp = 0;

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
    var json = JSON.parse(res.body);
    oauthAccessToken = json.access_token;
    oauthTokenValidUntil = helper.now() + 55*60*1000;
    done = true;
  });

  while (!done) {
    deasync.sleep(100);
  }
}

function userAgent() {
  return "script:" + environment['reddit-username'] + ":" + environment['version']
    + " (by: /u/" + environment['reddit-username'] + ")";
}

// Some duplication in post and get, story #150343477
function post(urlPath, form) {
  if (environment['dev-mode']) {
    helper.log(urlPath, form);
    return;
  }

  var content = null;

  request({
    url: 'https://oauth.reddit.com' + urlPath,
    method: 'POST',
    headers: {
      'User-Agent': userAgent()
    },
    auth: {
      'bearer': oauthAccessToken
    },
    form: form
  }, function(err, res) {
    if (err) {
      console.error("post error: ", err);
      content = undefined;
      return;
    }
    try {
      content = JSON.parse(res.body);
    } catch (e) {
      content= undefined;
    }
  });

  while (content === null) {
    deasync.sleep(50);
  }
  return content;
}

// Some duplication in post and get, story #150343477
function get(url) {
  let content = null;

  let options;

  if (url.startsWith('http')) {
    options = { url: url };
  } else {
    options = {
      url: 'https://oauth.reddit.com' + url,
      headers: {
        'User-Agent': userAgent()
      },
      auth: {
        'bearer': oauthAccessToken
      }
    };
  }

  request(options, function(err, res) {
    if (err) {
      console.error("get error: ", err);
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
  return content['data']['children'];
}

function getRedditComments(subreddit) {
  let content = get("https://www.reddit.com/r/" + subreddit + "/comments.json?limit=100");

  const unprocessedComments = content.reduce((memo, json) => {
    const commentData = json['data'];
    
    if (commentData['created_utc'] > lastProcessedCommentTimestamp) {
      memo.push({
        'body': commentData['body'],
        'author': commentData['author'],
        'id': commentData['name'],
        'link': commentData['link_permalink'] + commentData['id'],
        'subreddit': commentData['subreddit'],
        'timestamp' : commentData['created_utc']
      });
    }
    return memo;
  }, []);
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
        'timestamp' : data['created_utc']
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
  "postComment" : postComment,
  "getRedditComments" : getRedditComments,
  "getUnreadMessages" : getUnreadMessages,
  "markAllMessagesAsRead" : markAllMessagesAsRead,
  "filterCommentReplies" : filterCommentReplies,
  "filterPrivateMessages" : filterPrivateMessages
}
