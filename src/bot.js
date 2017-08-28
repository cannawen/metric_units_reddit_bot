const deasync = require('deasync');
const fs = require('fs');
const https = require('https');
const mkdirp = require('mkdirp');
const path = require('path');
const request = require('request');
const yaml = require('js-yaml');

const analytics = require('./analytics');
const converter = require('./converter');
const helper = require('./helper');
const network = require('./network');
const replier = require('./reply_maker');
const sass = require('./sass');

const environment = helper.environment();
const excludedSubreddits = yaml
    .safeLoad(fs.readFileSync('./src/excluded_subreddits.yaml', 'utf8'))
    .map(subreddit => subreddit.toLowerCase());
let sassed = {};

process.on('uncaughtException', function (err) {
  mkdirp("./private/errors");
  fs.writeFileSync("./private/errors/" + helper.now() + ".txt", err.stack, "utf8");
});

network.refreshToken();

setInterval(() => {
  const now = helper.now();

  network.refreshToken();
  
  const messages = network.getUnreadMessages();
  if (!messages) {
    return;
  }

  function messageIsShort(message) {
    return message['body'].length < 30;
  }

  network.markAllMessagesAsRead();

  network
    .filterCommentReplies(messages)
    .filter(messageIsShort)
    .forEach(message => {
      const reply = sass.reply(message);
      if (reply === undefined) {
        return;
      }
      
      if (message['subreddit'].match(/^totallynotrobots$/i)) {
        const humanReply = sass.humanReply(message);
        if (humanReply) {
          analytics.tracksass([message['timestamp'], message['link'], message['body'], reply, true]);
          network.postComment(message['id'], humanReply);
        }
        return;
      } 

      const postTitle = message['postTitle'];

      // Always replies if no sass in post within the last 24h
      // Replies 40% of the time otherwise
      // Possible refactor candidate, story #150342011
      const shouldReply = sassed[postTitle] === undefined || helper.random() > 0.6;
      analytics.trackSass([message['timestamp'], message['link'], message['body'], reply, shouldReply]);
      
      if (shouldReply) {
        sassed[postTitle] = now;
        network.postComment(message['id'], reply);
      }
    });

  network.filterPrivateMessages(messages)
    .filter(message => message['subject'].match(/stop/i))
    .forEach(message => {
      analytics.trackUnsubscribe([message['timestamp'], message['username']]);
      network.postComment(message['id'], replier.stopMessage);
      network.blockAuthorOfMessageWithId(message['id']);
    });

  //cleanup old sassed
  sassed = Object
    .keys(sassed)
    .reduce((memo, key) => {
      const lessThan24hAgo = sassed[key] > now - 24*60*60*1000;
      if (lessThan24hAgo) {
        memo[key] = sassed[key];
      }
      return memo;
    }, {});
    
}, 60*1000)

setInterval(() => {
  const comments = network.getRedditComments("all");
  if (!comments) {
    return;
  }
  
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

  function isNotSarcastic(comment) {
    return comment['body'].match(/\b\/s\b/i) === null;
  }

  function hasNumber(comment) {
    return comment['body'].match(/\d/) !== null;
  }

  function hasConversions(map) {
    return Object.keys(map['conversions']).length > 0;
  }

  comments
    .filter(commentIsntFromABot)
    .filter(allowedToPostInSubreddit)
    .filter(postIsShort)
    .filter(hasNumber)
    .filter(isNotSarcastic)
    .map(comment => {
      return {
        "comment" : comment,
        "conversions" : converter.conversions(comment)
      }
    })
    .filter(hasConversions)
    .forEach(map => {
      const comment = map['comment'];
      const conversions = map['conversions'];

      const reply = replier.formatReply(comment, conversions);

      analytics.trackConversion([comment['timestamp'], comment['link'], comment['body'], conversions]);
      network.postComment(comment['id'], reply);
    })
}, 2*1000);  
