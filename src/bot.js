const deasync = require('deasync');
const fs = require('fs');
const https = require('https');
const path = require('path');
const request = require('request');
const yaml = require('js-yaml');

const converter = require('./converter');
const environment = require('./helper').environment();
const formatter = require('./formatter');
const network = require('./network');
const snark = require('./snark');

//Do not post in these subreddits
const excludedSubreddits = [
  "denver",
  "veterans",
  "artc",
  "baseball",
  "asksciencediscussion",
  "churning",
  "awardtravel",
  "churningcanada",
  "mlbtheshow",
  "fitness",
  "cars",
  "UKPersonalFinance",
  "science",
  "dayton",
  "askscience",
  "Tennesseetitans",
  "NASCAR",
  "legaladvice"
].map(subreddit => subreddit.toLowerCase());

network.refreshToken();

setInterval(() => {
  network.refreshToken();

  network
    .getUnreadRepliesAndMarkAllAsRead()
    .filter(message => {
      return snark.shouldReply(message['body']);
    })
    .forEach(message => {
      const reply = snark.reply(message['body']);
      network.postComment(message['id'], reply);
    });

}, 60*1000)

setInterval(() => {
  function thisBotWroteComment(comment) {
      return comment['author'].toLowerCase() !== environment['reddit-username'].toLowerCase();
  }

  function allowedToPostInSubreddit(comment) {
      return excludedSubreddits.indexOf(comment['subreddit'].toLowerCase()) === -1;
  }

  network
    .getRedditComments("all")
    .filter(comment => {
      return converter.shouldConvert(comment['commentBody']);
    })
    .filter(comment => {
      return thisBotWroteComment(comment);
    })    
    .filter(comment => {
      return allowedToPostInSubreddit(comment);
    })
    .forEach(comment => {
      const commentBody = comment['commentBody'];
      
      const conversions = converter.conversions(commentBody);
      const reply = formatter.formatReply(commentBody, conversions);

      network.postComment(comment['id'], reply);
    })
}, 2*1000);  
