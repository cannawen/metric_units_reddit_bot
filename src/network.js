const deasync = require('deasync');
const fs = require('fs');
const path = require('path');
const request = require('request');
const yaml = require('js-yaml');

const environment = require('./helper').environment();
const helper = require('./helper');

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
    + " (by: /u/" + environment['reddit-username'] + ")"
}

function post(urlPath, form) {
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
    if (err)  {
      console.error("get error: ", err);
      content = undefined
    } else {
      try {
        content = JSON.parse(res.body);
      } catch (e) {
        content = undefined;
      }
    }
  });

  while (content === null) {
    deasync.sleep(50);
  }
  return content['data']['children'];
}

function getRedditComments(subreddit) {
  let content = get("https://www.reddit.com/r/" + subreddit + "/comments.json");

  const unprocessedComments = content.reduce((memo, yaml) => {
    const commentData = yaml['data'];
    if (commentData['created_utc'] > lastProcessedCommentTimestamp) {
      memo.push({
        'commentBody': commentData['body'],
        'author': commentData['author'],
        'id': commentData['name'],
        'subreddit': commentData['subreddit']
      });
    }
    return memo;
  }, []);
  lastProcessedCommentTimestamp = content[0]['data']['created_utc'];
  return unprocessedComments;
}

function postComment(parentId, markdownBody) {
  const form = {
    'parent' : parentId,
    'text' : markdownBody
  }
  console.log(form);
  // post('/api/comment', form);
}

function getUnreadRepliesAndMarkAllAsRead() {
  const messages = get("/message/unread");
  post('/api/read_all_messages');

  return messages.filter(raw => {
    return raw['kind'] === 't1';
  }).map(raw => {
    return {
      'body': raw['data']['body'],
      'id': raw['data']['name'],
      'submission': raw['data']['link_title']
    }
  });
}

module.exports = {
  "refreshToken" : refreshToken,
  "postComment" : postComment,
  "getRedditComments" : getRedditComments,
  "getUnreadRepliesAndMarkAllAsRead" : getUnreadRepliesAndMarkAllAsRead 
}