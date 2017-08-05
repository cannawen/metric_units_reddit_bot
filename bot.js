const deasync = require('deasync');
const fs = require('fs');
const https = require('https');
const path = require('path');
const request = require('request');
const yaml = require('js-yaml');

const converter = require('./converter');
const network = require('./network');

//TODO not yet implemented
//Add USA-based subreddits
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
  return message + "\n\n----\n^Beep ^boop, ^I ^am ^a ^bot ^that ^converts ^posts ^to ^SI ^units"
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
