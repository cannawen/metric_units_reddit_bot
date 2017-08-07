const deasync = require('deasync');
const fs = require('fs');
const https = require('https');
const path = require('path');
const request = require('request');
const yaml = require('js-yaml');

const converter = require('./converter');
const formatter = require('./formatter');
const network = require('./network');

const MY_NAME_IS = "si_units_bot";

//TODO
//Add USA-based subreddits
const excludedSubreddits = [
  "denver",
  "veterans",
  "artc",
  "baseball",
  "asksciencediscussion"
];

function filterComments(comments) {
  return comments.filter(comment => {
    const thisBotWroteComment = comment['author'].toLowerCase() === MY_NAME_IS.toLowerCase();
    const commentFromExcludedSubreddit = excludedSubreddits.indexOf(comment['subreddit'].toLowerCase()) !== -1;
    return !(thisBotWroteComment || commentFromExcludedSubreddit);
  });
}

function constructReplies(comments) {
  return comments.reduce((memo, comment) => {
    const commentBody = comment['commentBody'];
    if (converter.shouldConvert(commentBody)) {
      memo.push({
        'commentBody' : formatter.formatReply(commentBody, converter.conversions(commentBody)),
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

  const comments = network.getRedditComments("all");
  const filteredComments = filterComments(comments);
  const replies = constructReplies(filteredComments);
  postComments(replies);
}, 2*1000);  
