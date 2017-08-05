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

];

function convertComments(comments) {
  return comments.reduce((memo, comment) => {
    const commentBody = comment['commentBody'];
    if (converter.shouldConvert(commentBody)) {
      memo.push({
        'commentBody' : createReply(commentBody),
        'id' : comment['id']
      })
    }
    return memo;
  }, [])
}

function createReply(originalComment) {
  const conversions = converter.convertString(originalComment);
  var message;
  if (originalComment.length > 100) {
    //Tabular data
    message = Object.keys(conversions).reduce((memo, nonSIvalue) => {
      const SIvalue = conversions[nonSIvalue];
      return memo + nonSIvalue + "|" + SIvalue | "\n";
    }, "Original measurement | SI measurement\n---|---\n")
  } else {
    message = Object.keys(conversions).sort(function(a, b) {
      return b.length - a.length;
    }).reduce((memo, nonSIvalue) => {
      return memo.replace(new RegExp(nonSIvalue, 'g'), conversions[nonSIvalue]);
    }, originalComment);
  }
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
