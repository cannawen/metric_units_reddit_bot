const deasync = require('deasync');
const fs = require('fs');
const https = require('https');
const path = require('path');
const request = require('request');
const yaml = require('js-yaml');

const converter = require('./converter');
const formatter = require('./formatter');
const network = require('./network');
const snark = require('./snark');

const MY_NAME_IS = "si_units_bot";

//TODO
//Add USA-based subreddits
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
].map(reddit => reddit.toLowerCase());

network.refreshToken();

setInterval(() => {
  network.refreshToken();

  network
    .getUnreadRepliesAndMarkAllAsRead()
    .filter(message => {
      return snark.shouldReply(message['body']);
    })
    .map(message => {
      const reply = snark.reply(message['body']);
      network.postComment(message['id'], reply);
    });

}, 60*1000)

// setInterval(() => {
//   network
//     .getRedditComments("all")
//     .filter(comment => {
//       //Has value to convert
//       return converter.shouldConvert(comment['commentBody']);
//     })
//     .filter(comment => {
//       //I did not write it
//       return comment['author'].toLowerCase() !== MY_NAME_IS.toLowerCase();
//     })    
//     .filter(comment => {
//       //Is not part of excluded subreddits
//       return excludedSubreddits.indexOf(comment['subreddit'].toLowerCase()) === -1;
//     })
//     .map(comment => {
//       //Construct reply
//       const commentBody = comment['commentBody'];
//       const conversions = converter.conversions(commentBody);
//       return {
//         'commentBody' : formatter.formatReply(commentBody, conversions),
//         'id' : comment['id']
//       }
//     })
//     .forEach(comment => {
//       //Post reply
//       network.postComment(comment['id'], comment['commentBody']);    
//     });
// }, 2*1000);  
