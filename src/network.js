const deasync = require('deasync');
const fs = require('fs');
const path = require('path');
const request = require('request');
const yaml = require('js-yaml');

var oauthAccessToken = undefined;
var oauthTokenValidUntil = undefined;
var lastProcessedCommentTimestamp = 0;

function refreshToken() {
  if (Date.now() < oauthTokenValidUntil) {
    return;
  }

  var done = false;

  request({
    url: 'https://www.reddit.com/api/v1/access_token',
    method: 'POST',
    auth: {
      user: 'lNQBbnDfqX9p6Q',
      pass: '4wAQS41IV9gllE4kECo-v2gUM7Q'
    },
    form: {
      'grant_type': 'password',
      'username': 'SI_units_bot',
      'password': 'cocktail-pupa-ably'
    }
  }, function(err, res) {
    var json = JSON.parse(res.body);
    oauthAccessToken = json.access_token;
    oauthTokenValidUntil = Date.now() + 55*60*1000;
    done = true;
  });

  while(!done) {
    deasync.sleep(100);
  }
}

function post(urlPath, form) {
  var content = null;

  request({
    url: 'https://oauth.reddit.com' + urlPath,
    method: 'POST',
    headers: {
      'User-Agent': 'script:SIUnits:0.1 (by /u/SI_units_bot)'
    },
    auth: {
      'bearer': oauthAccessToken
    },
    form: form
  }, function(err, res) {
    if (err) {
      console.log(err);
      content = undefined;
    }
    try {
      content = JSON.parse(res.body);
    } catch (e) {
      // console.log(e);
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

  if (!url.startsWith('http')) {
    url = 'https://oauth.reddit.com' + url;
  }

  request({
    url: url,
    headers: {
      'User-Agent': 'SIUnits/0.1 by SI_units_bot'
    },
    auth: {
      'bearer': oauthAccessToken
    },
  }, function(err, res) {
    if (err)  {
      console.log(err);
      content = undefined
    } else {
      try {
        content = JSON.parse(res.body);
      } catch (e) {
        // console.log(e);
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

  const unprocessedComments = commentsData.reduce((memo, yaml) => {
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
  lastProcessedCommentTimestamp = commentsData[0]['data']['created_utc'];
  return unprocessedComments;
}

function postComment(parentId, markdownBody) {
  const form = {
    'parent' : parentId,
    'text' : markdownBody
  }
  post('/api/comment', form);
}

function getUnreadRepliesAndMarkAllAsRead() {
  const messages = get("/message/unread")
  .filter(raw => {
    return raw['kind'] === 't1';
  }).map(raw => {
    return {
      'body': raw['data']['body'],
      'id': raw['data']['name']
    }
  });

  post('/api/read_all_messages');
  
  return messages;
}

module.exports = {
  "get" : get,
  "refreshToken" : refreshToken,
  "postComment" : postComment,
  "getRedditComments" : getRedditComments,
  "getUnreadRepliesAndMarkAllAsRead" : getUnreadRepliesAndMarkAllAsRead 
}