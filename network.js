const deasync = require('deasync');
const fs = require('fs');
const https = require('https');
const path = require('path');
const request = require('request');
const yaml = require('js-yaml');

var oauthAccessToken = undefined;
var oauthTokenValidUntil = undefined;

function refreshToken() {
  if (Date.now < oauthTokenValidUntil) {
    return;
  }

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
  });
}

function post(urlPath, form) {
  request({
    url: 'https://oauth.reddit.com' + urlPath,
    method: 'POST',
    headers: {
      'User-Agent': 'SIUnits/0.1 by SI_units_bot'
    },
    auth: {
      'bearer': oauthAccessToken
    },
    form: form
  }, function(err, res) {
    console.log(err);
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
    var json = JSON.parse(res.body);
    return json;
  });
}

function getRedditComments() {
  // let content = null;

  // const url = "https://www.reddit.com/r/all/comments.json";
  // https.get(url, function(res) {
  //   res.setEncoding('utf8');

  //   let chunks = "";
  //   res.on('data', function(chunk) { 
  //     chunks += chunk;
  //   });
  //   res.on('end', function() {
  //     content = chunks;
  //   });

  // }).on("error", function(e){
  //   content = undefined;
  // });

  // while(content === null) {
  //   deasync.sleep(50);
  // }

  let content = fs.readFileSync('./comments.js', 'utf8');


  return yaml.safeLoad(content)['data']['children'].map(yaml => {
    const commentData = yaml['data'];
    return {
      'commentBody': commentData['body_html'],
      'id': commentData['name']
    }
  });
}

function postComment(parentId, markdownBody) {
  const form = {
    'parent' : parentId,
    'text' : markdownBody
  }
  post('/api/comment', form);
}

module.exports = {
  "get" : get,
  "refreshToken" : refreshToken,
  "postComment" : postComment,
  "getRedditComments" : getRedditComments
}