const deasync = require('deasync');
const fs = require('fs');
const https = require('https');
const path = require('path');
const request = require('request');
const yaml = require('js-yaml');

const converter = require('./converter');
const network = require('./network');

//TODO not yet implemented
const excludedSubreddits = [
  'nanny', 
  'relationships'
];

function convertComments(comments) {
  return comments.reduce((memo, comment) => {
    const commentBody = comment['commentBody'];
    if (converter.shouldConvert(commentBody)) {
      memo.push({
        'commentBody' : appendBotMessage(converter.convertString(commentBody)),
        'id' : comment['id']
      })
    }
    return memo;
  }, [])
}

function appendBotMessage(message) {
  return "Beep boop, I am a bot that converts posts to SI units" + "\n----\n" + message + "\n----\nProblem with this conversion? Please send me a message and let me know!"
}

function postComments(comments) {
  comments.forEach(comment => {
    network.postComment(comment['id'], comment['commentBody']);    
  })
}

setInterval(() => {
  network.refreshToken();

  const comments = network.getRedditComments("all");
  const modifiedComments = convertComments(comments);
  postComments(modifiedComments);
}, 2*1000);  
