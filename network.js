const deasync = require('deasync');
const fs = require('fs');
const https = require('https');
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
    if (err) console.log(err);
    var json = JSON.parse(res.body);
    return json;
  });
}

function get(urlPath) {
  request({
    url: 'https://oauth.reddit.com' + urlPath,
    headers: {
      'User-Agent': 'SIUnits/0.1 by SI_units_bot'
    },
    auth: {
      'bearer': oauthAccessToken
    },
  }, function(err, res) {
    if (err) console.log(err);
    var json = JSON.parse(res.body);
    return json;
  });
}

function getRedditComments(subreddit) {
  let content = null;

  const url = "https://www.reddit.com/r/" + subreddit + "/comments.json";
  https.get(url, function(res) {
    res.setEncoding('utf8');

    let chunks = "";
    res.on('data', function(chunk) { 
      chunks += chunk;
    });
    res.on('end', function() {
      content = chunks;
    });

  }).on("error", function(e){
    if (e) console.log(e);
    content = undefined;
  });

  while(content === null) {
    deasync.sleep(50);
  }

  const commentsData = yaml.safeLoad(content)['data']['children'];

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
  // console.log(form);
  post('/api/comment', form);
}

module.exports = {
  "get" : get,
  "refreshToken" : refreshToken,
  "postComment" : postComment,
  "getRedditComments" : getRedditComments
}