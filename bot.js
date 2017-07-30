const deasync = require('deasync');
const fs = require('fs');
const https = require('https');
const path = require('path');
const request = require('request');
const yaml = require('js-yaml');

const converter = require('./converter');
const network = require('./network');

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
  comments.forEach(comment => {
    network.postComment(comment['id'], comment['commentBody']);    
  })
}


setInterval(() => {
  network.refreshToken();

  const comments = network.getRedditComments("cooking");
  const modifiedComments = convertComments(comments);
  postComments(modifiedComments);
}, 5*1000);  
