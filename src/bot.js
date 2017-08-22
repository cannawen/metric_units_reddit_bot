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

const environment = helper.environment();
const excludedSubreddits 
  = yaml
    .safeLoad(
      fs.readFileSync('./src/excluded_subreddits.yaml', 'utf8')
    )
    .map(subreddit => subreddit.toLowerCase());
let snarked = {};

network.refreshToken();

setInterval(() => {
  function messageIsShort(message) {
    return message['body'].length < 25;
  }
  
  function cleanupOldSnarked() {
    snarked = 
      Object
      .keys(snarked)
      .reduce((memo, key) => {
        const lessThan24hAgo = snarked[key] > now - 24*60*60*1000;
        if (lessThan24hAgo) {
          memo[key] = snarked[key];
        }
        return memo;
      }, {});
  };

  const now = helper.now();

  network.refreshToken();
  cleanupOldSnarked();
  
  const messages = network.getUnreadMessages();
  network.markAllMessagesAsRead();

  network
    .filterCommentReplies(messages)
    .filter(messageIsShort)
    .forEach(message => {
      const reply = snark.reply(message['body']);
      if (reply === undefined) {
        return;
      }

      const postTitle = message['submission'];

      // Always replies if no snark in post within the last 24h
      // Replies 40% of the time otherwise
      // Possible refactor candidate, story #150342011
      const shouldReply = snarked[postTitle] === undefined || helper.random() > 0.6;
      
      if (shouldReply) {
        snarked[postTitle] = now;
        network.postComment(message['id'], reply);
      }

      analytics.trackSnark([message['timestamp'], message['link'], message['body'], reply, shouldReply]);
    });


  const stopMessage = "Please click 'block user' below and you will not see any more conversions from this bot.\n\nSo long, and thanks for all the fish";
  network.filterPrivateMessages(messages)
    .filter(message => message['subject'] === "stop")
    .forEach(message => {
      network.postComment(message['id'], stopMessage);
      analytics.trackUnsubscribe([message['timestamp'], message['username']]);
    });

}, 60*1000)

setInterval(() => {

  function allowedToPostInSubreddit(comment) {
      return excludedSubreddits.indexOf(comment['subreddit'].toLowerCase()) === -1;
  }

  function commentIsntFromABot(comment) {
    const noBotInCommentBody = comment['body'].match(/\bbot\b/gi) === null;
    const noBotInAuthorName = comment['author'].match(/bot/gi) === null;
    const thisBotDidntWriteComment = comment['author'].toLowerCase() !== environment['reddit-username'].toLowerCase();
    return noBotInCommentBody && noBotInAuthorName && thisBotDidntWriteComment;
  }

  function postIsShort(comment) {
    return comment['body'].length < 300;
  }

  function hasNumber(comment) {
    return comment['body'].match(/\d/) !== null;
  }

  function hasConversions(map) {
    return Object.keys(map['conversions']).length > 0;
  }

  network
    .getRedditComments("all")
    .filter(commentIsntFromABot)
    .filter(allowedToPostInSubreddit)
    .filter(postIsShort)
    .filter(hasNumber)
    .map(comment => {
      return {
        "comment" : comment,
        "conversions" : converter.conversions(comment['body'])
      }
    })
    .filter(hasConversions)
    .forEach(map => {
      const comment = map['comment'];
      const conversions = map['conversions'];

      const reply = formatter.formatReply(comment, conversions);
      network.postComment(comment['id'], reply);

      analytics.trackConversion([comment['timestamp'], comment['link'], comment['body'], conversions]);
    })
}, 2*1000);  
