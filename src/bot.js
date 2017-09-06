const deasync = require('deasync');
const fs = require('fs');
const https = require('https');
const path = require('path');
const request = require('request');
const yaml = require('js-yaml');

const analytics = require('./analytics');
const converter = require('./converter');
const helper = require('./helper');
const network = require('./network');
const replier = require('./reply_maker');
const personality = require('./personality');

const environment = helper.environment();
const excludedSubreddits = yaml
    .safeLoad(fs.readFileSync('./src/excluded_subreddits.yaml', 'utf8'))
    .map(subreddit => subreddit.toLowerCase());
let personalityMetadata = {};

process.on('uncaughtException', function (err) {
  helper.logError(err);
});

network.refreshToken();
helper.setIntervalSafely(postConversions, 2);
helper.setIntervalSafely(replyToMessages, 60);

function replyToMessages() {
  function filterCommentReplies(messages) {
    return messages
      .filter(raw => raw['kind'] === 't1')
      .map(raw => raw['data'])
      .map(data => {
        return {
          'body': data['body'],
          'id': data['name'],
          'postTitle': data['link_title'],
          'link': 'https://www.reddit.com' + data['context'],
          'timestamp' : data['created_utc'],
          'subreddit' : data['subreddit'],
          'username' : data['author']
        }
      });
  }

  function filterPrivateMessages(messages) {
    return messages
      .filter(raw => raw['kind'] === 't4')
      .map(raw => raw['data'])
      .map(data => {
        return {
          'body' : data['body'],
          'subject' : data['subject'],
          'id' : data['name'],
          'username' : data['author'],
          'timestamp' : data['created_utc']
        }
      });
  }

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

  filterCommentReplies(messages)
    .filter(messageIsShort)
    .forEach(message => {
      const reply = personality.reply(message);
      if (reply === undefined) {
        return;
      }
      
      if (message['subreddit'].match(/^totallynotrobots$/i)) {
        const humanReply = personality.humanReply(message);
        if (humanReply) {
          analytics.trackPersonality([message['timestamp'], message['link'], message['body'], reply, true]);
          network.postComment(message['id'], humanReply);
        }
        return;
      } 

      const postTitle = message['postTitle'];

      // Always replies if no personality in post within the last 24h
      // Replies are 50% less likely for each reply within 24 hours
      // Possible refactor candidate, story #150342011
      let shouldReply = false;

      if (personalityMetadata[postTitle] === undefined) {
        shouldReply = true;
        personalityMetadata[postTitle] = { 'timestamp' : now, 
                              'replyChance' : 0.5 };
      } else if (helper.random() < personalityMetadata[postTitle]['replyChance']) {
        shouldReply = true;
        personalityMetadata[postTitle]= { 'timestamp' : now, 
                             'replyChance': personalityMetadata[postTitle]['replyChance'] / 2};
      }


      analytics.trackPersonality([message['timestamp'], message['link'], message['body'], reply, shouldReply]);
      
      if (shouldReply) {
        network.postComment(message['id'], reply);
      }
    });

  filterPrivateMessages(messages)
    .filter(message => message['subject'].match(/stop/i))
    .forEach(message => {
      analytics.trackUnsubscribe([message['timestamp'], message['username']]);
      network.postComment(message['id'], replier.stopMessage);
      network.blockAuthorOfMessageWithId(message['id']);
    });

  //cleanup old personalityMetadata
  personalityMetadata = Object
    .keys(personalityMetadata)
    .reduce((memo, key) => {
      const lessThan24hAgo = personalityMetadata[key]['timestamp'] > now - 24*60*60*1000;
      if (lessThan24hAgo) {
        memo[key] = personalityMetadata[key];
      }
      return memo;
    }, {});
    
};

function postConversions() {
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
    return comment['body'].match(new RegExp("(^|[ \\n])/s($|[ \\n])", 'i')) === null;
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
};  
