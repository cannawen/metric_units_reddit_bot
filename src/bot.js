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

const excludedSubreddits 
  = yaml
    .safeLoad(
      fs.readFileSync('./src/excluded-subreddits.yaml', 'utf8')
    )
    .map(subreddit => subreddit.toLowerCase());

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
      if (reply !== undefined) {
        network.postComment(message['id'], reply);
      }
    });

}, 60*1000)

setInterval(() => {
  function thisBotDidntWriteComment(comment) {
      return comment['author'].toLowerCase() !== environment['reddit-username'].toLowerCase();
  }

  function allowedToPostInSubreddit(comment) {
      return excludedSubreddits.indexOf(comment['subreddit'].toLowerCase()) === -1;
  }

  function commentDoesntMentionsBot(comment) {
    return comment['commentBody'].match(/\bbot\b/gi) === null;
  }

  function postIsShort(comment) {
    return comment['commentBody'].length < 300;
  }

  function hasNumber(comment) {
    return comment['commentBody'].match(/\d/) !== null;
  }

  network
    .getRedditComments("all")
    .filter(thisBotDidntWriteComment)
    .filter(allowedToPostInSubreddit)
    .filter(commentDoesntMentionsBot)
    .filter(postIsShort)
    .filter(hasNumber)
    .map(comment => {
      const conversions = converter.conversions(comment['commentBody']);
      return {
        "comment" : comment,
        "conversions" : conversions
      }
    })
    .filter(map => Object.keys(map['conversions']).length > 0)
    .forEach(map => {
      const reply = formatter.formatReply(map['comment'], map['conversions']);
      network.postComment(map['comment']['id'], reply);
    })
}, 2*1000);  
