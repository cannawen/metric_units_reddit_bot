const deasync = require('deasync');
const fs = require('fs');
const https = require('https');
const path = require('path');
const request = require('request');
const yaml = require('js-yaml');

const analytics = require('./analytics');
const converter = require('./converter');
const formatter = require('./formatter');
const helper = require('./helper');
const network = require('./network');
const snark = require('./snark');

const environment = require('./helper').environment();
const excludedSubreddits 
  = yaml
    .safeLoad(
      fs.readFileSync('./src/excluded-subreddits.yaml', 'utf8')
    )
    .map(subreddit => subreddit.toLowerCase());
let snarked = {};

network.refreshToken();

setInterval(() => {
  function messageIsShort(message) {
    return message['body'].length < 25;
  }
  
  function cleanupOldSnarked() {
    snarked = Object.keys(snarked).reduce((memo, key) => {
      const yesterday = now - 24*60*60*1000;
      if (snarked[key] > yesterday) {
        memo[key] = now;
      }
      return memo;
    }, {});
  };

  const now = helper.now();

  network.refreshToken();
  cleanupOldSnarked();

  network
    .getUnreadRepliesAndMarkAllAsRead()
    .filter(messageIsShort)
    .forEach(message => {
      const reply = snark.reply(message['body']);
      if (reply === undefined) {
        return;
      }
      const postTitle = message['submission'];

      if (reply) {
        const shouldReply = snarked[postTitle] === undefined || helper.random() > 0.6;
        
        if (shouldReply) {
          snarked[postTitle] = now;
          network.postComment(message['id'], reply);
        }

        analytics.trackSnark(message['link'], message['body'], shouldReply);
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
    return comment['body'].match(/\bbot\b/gi) === null;
  }

  function postIsShort(comment) {
    return comment['body'].length < 300;
  }

  function hasNumber(comment) {
    return comment['body'].match(/\d/) !== null;
  }

  network
    .getRedditComments("all")
    .filter(thisBotDidntWriteComment)
    .filter(allowedToPostInSubreddit)
    .filter(commentDoesntMentionsBot)
    .filter(postIsShort)
    .filter(hasNumber)
    .map(comment => {
      const conversions = converter.conversions(comment['body']);
      return {
        "comment" : comment,
        "conversions" : conversions
      }
    })
    .filter(map => Object.keys(map['conversions']).length > 0)
    .forEach(map => {
      const comment = map['comment'];
      const reply = formatter.formatReply(comment, map['conversions']);
      analytics.trackConversion(comment['link'], comment['body'], map['conversions']);
      network.postComment(comment['id'], reply);
    })
}, 2*1000);  
