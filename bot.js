const deasync = require('deasync');
const fs = require('fs');
const https = require('https');
const path = require('path');
const request = require('request');
const yaml = require('js-yaml');

const converter = require('./converter')

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

function convertComments(comments) {
  return comments.reduce((memo, comment) => {
    const commentBody = comment['commentBody'];
    if (converter.shouldConvert(commentBody)) {
      memo.push({
        'commentBody' : converter.convertString(commentBody),
        'id' : comment['id']
      })
    }
    return memo;
  }, [])
}

function postComments(comments) {
  request({
    url: 'https://www.reddit.com/api/v1/access_token',
    headers: {
      'User-Agent': 'SIUnits/0.1 by SI_units_bot'
    },
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
    var accessToken = json.access_token;
    console.log("Access Token:", accessToken);
   
    request({
      url: 'https://oauth.reddit.com/api/v1/me',
      headers: {
        'User-Agent': 'SIUnits/0.1 by SI_units_bot'
      },
      auth: {
        'bearer': accessToken
      }
    }, function(err, res) {
      console.log(res.body);
    });

  });
}

// const comments = getRedditComments();
// const modifiedComments = convertComments(comments);

// console.log(modifiedComments);

postComments();


