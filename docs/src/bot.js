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
let replyMetadata = {};
let excludedSubreddits = [];
try {
  excludedSubreddits = yaml
    .safeLoad(fs.readFileSync('./private/excluded_subreddits.yaml', 'utf8'))
    .map(subreddit => subreddit.toLowerCase());
} catch (e) {
  // helper.logError(e);
}

process.on('uncaughtException', function (err) {
  helper.logError(err);
});

network.refreshToken()
  .then(() => {
    helper.setIntervalSafely(postConversions, 1);
    helper.setIntervalSafely(replyToMessages, 60);
  });

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

  function messageIsShort(message) {
    return message['body'].length < 30;
  }

  const now = helper.now();

  return network.refreshToken().then(() => {
    return network.getUnreadMessages().then((messages) => {
      network.markAllMessagesAsRead();

      if (!messages) {
        return;
      }

      filterCommentReplies(messages)
        .filter(messageIsShort)
        .forEach(message => {
          const reply = personality.robotReply(message);
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
          let shouldReply = false;

          if (replyMetadata[postTitle] === undefined) {
            shouldReply = true;
            replyMetadata[postTitle] = {
              'timestamp' : now,
              'personalityReplyChance' : 0.5
            };

          } else if (helper.random() < replyMetadata[postTitle]['personalityReplyChance']) {
            shouldReply = true;
            Object.assign(replyMetadata[postTitle], {
              'timestamp' : now,
              'personalityReplyChance': replyMetadata[postTitle]['personalityReplyChance'] / 2
            });
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

      filterPrivateMessages(messages)
        .filter(message => message['subject'].match(/refresh (\w+)/i))
        .forEach(message => {
          const commentId = message['subject'].match(/refresh (\w+)/i)[1];

          network.getComment(commentId)
            .then((comment) => {
              if (! comment) {
                return;
              }

              network.getCommentReplies(comment['link_id'], commentId)
                .then((commentReplies) => {
                  const botReply = commentReplies.find(reply => {
                    return reply['data']['author'].toLowerCase() == environment['reddit-username'].toLowerCase();
                  });

                  if (! botReply) {
                    return;
                  }

                  const conversions = converter.conversions(comment);
                  let reply = replier.formatReply(comment, conversions);

                  if (Object.keys(conversions).length === 0) {
                    reply = personality.robotReply({ "body" : "_time_waster", "username" : comment['author'] });
                  }

                  network.editComment('t1_' + botReply['data']['id'], "Edit: " + reply);

                  if (! comment['link_id']) {
                    comment['link_id'] = 't3_value';
                  }

                  analytics.trackEdit([message['timestamp'], 'https://reddit.com/comments/' + comment['link_id'].replace(/t3_/g, '') + '//' + commentId, comment['body'], conversions]);
                });
            });
        });

      //cleanup old replyMetadata
      replyMetadata = Object
        .keys(replyMetadata)
        .reduce((memo, key) => {
          const lessThan24hAgo = replyMetadata[key]['timestamp'] > now - 24*60*60*1000;
          if (lessThan24hAgo) {
            memo[key] = replyMetadata[key];
          }
          return memo;
        }, {});
      });
    });
};

function postConversions() {
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

  function filterIfAlreadyReplied(map) {
    const postTitle = map['comment']['postTitle'];
    const conversions = map['conversions'];

    const newConversions = new Set(Object.keys(conversions));

    //If we have not seen this post within 24 hours
    if (replyMetadata[postTitle] === undefined) {
      replyMetadata[postTitle] = {
          'timestamp' : helper.now(),
          'personalityReplyChance' : 1,
          'conversions' : newConversions
      }
      //We should perform conversions
      return map;

    //If we have seen this post within 24 hours
    } else {
      const alreadyConverted = replyMetadata[postTitle]['conversions'];

      //If we have done personality but not converted
      if (alreadyConverted === undefined) {
        replyMetadata[postTitle] = Object.assign(replyMetadata[postTitle], {
          'conversions' : newConversions
        });
        //We should perform the conversion
        return map;

      //If we have converted something
      } else {
        const unconverted = [...newConversions].filter(x => !alreadyConverted.has(x));
        //If all conversions in the current comment have already been converted
        if (unconverted.length === 0) {
          //Do not convert anything for this comment
          return Object.assign(map, {'conversions' : {}});

        //If one or more of the conversions in this comment have not been converted
        } else {
          replyMetadata[postTitle] = Object.assign(replyMetadata[postTitle], {
            'conversions' : new Set([...alreadyConverted, ...newConversions])
          });
          //Convert all conversions in this comment
          return map;
        }
      }
    }
  }

  function hasConversions(map) {
    return Object.keys(map['conversions']).length > 0;
  }

  return network.getRedditComments("all")
    .then((comments) => {
      if (!comments) {
        return;
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
        .map(filterIfAlreadyReplied)
        .filter(hasConversions)
        .forEach(map => {
          const comment = map['comment'];
          const conversions = map['conversions'];

          const reply = replier.formatReply(comment, conversions);

          analytics.trackConversion([comment['timestamp'], comment['link'], comment['body'], conversions]);
          network.postComment(comment['id'], reply);
        })
    }).catch((error) => {
      analytics.trackError(error)
    });
};
