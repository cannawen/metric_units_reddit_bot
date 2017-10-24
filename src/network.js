const fs = require('fs');
const path = require('path');
const request = require('request');

const helper = require('./helper');
const environment = helper.environment();

var oauthAccessToken = undefined;
var oauthTokenValidUntil = undefined;
var lastProcessedCommentId = undefined;

function get(url) {
  let requestPromise;

  if (url.startsWith('http')) {
    requestPromise = networkRequest({ url: url }, false);
  } else {
    requestPromise = networkRequest({ url: 'https://oauth.reddit.com' + url }, true);
  }

  return requestPromise;
}

function post(urlPath, form) {
  if (environment['dev-mode']) {
    helper.log(urlPath, form);
    return Promise.resolve();
  }

  return networkRequest({
    url: 'https://oauth.reddit.com' + urlPath,
    method: 'POST',
    form: form
  }, true);
}

/**
 * Makes a network request.
 * @param  {Object}   options      - The request options.
 * @param  {Boolean}  oauthRequest - Whether the request is an oauthRequest.
 * @return {Promise}  The promise of a response from the network request.
 */
function networkRequest(options, oauthRequest) {
  function redditOauthHeader() {
    const userAgent =
     "script:" + environment['reddit-username'] + ":" + environment['version']
      + " (by: /u/" + environment['reddit-username'] + ")";

    return {
      headers: {
        'User-Agent': userAgent
      },
      auth: {
        'bearer': oauthAccessToken
      },
    }
  }

  if (oauthRequest) {
    options = Object.assign(redditOauthHeader(), options);
  }

  return new Promise((resolve, reject) => {
    request(options, function(err, res) {
      if (err) {
        console.error("network error:", err);
        oauthTokenValidUntil = 0;
        reject(err);
      }
      try {
        const json = JSON.parse(res.body);
        resolve(json);
      } catch (e) {
        reject(e);
      }
    });
  });
}

/**
 * Refreshes the API access token.
 * @return {Promise} Resolved when the token is refreshed.
 */
function refreshToken() {
  if (helper.now() < oauthTokenValidUntil) {
    // The token is still valid, we don't need to refresh it.
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    request({
      url: 'https://www.reddit.com/api/v1/access_token',
      method: 'POST',
      auth: {
        user: environment['oauth-username'],
        pass: environment['oauth-secret']
      },
      form: {
        'grant_type': 'password',
        'username': environment['reddit-username'],
        'password': environment['reddit-password']
      }
    }, function(err, res) {
      try {
        var json = JSON.parse(res.body);
        oauthAccessToken = json.access_token;
        oauthTokenValidUntil = helper.now() + 55*60*1000;
        resolve();
      } catch (e) {
        // console.error("oauth error:", e);
        oauthTokenValidUntil = 0;
        reject(e);
      }
    });
  });
}

//Utility to generate excluded subreddits yaml
function printBannedSubreddits() {
  /**
   * Gets all messages from the inbox recursively.
   * @param  {String} lastMessageId  - Get messages after the message with this id.
   * @param  {Array}  messagesList   - The running total list of all messages.
   * @return {Promise} The promise of messages.
   */
  function getMessages (lastMessageId, messagesList) {
    // Default messagesList to an empty array when it is missing.
    messagesList = messagesList || [];

    // Build up the endpoint.
    const limit = 100;
    const messageUrl = `/message/inbox?limit=${ limit }`;
    const endpoint = (!lastMessageId) ? messageUrl : `${ messageUrl }&after=${ lastMessageId }`;

    return new Promise((resolve, reject) => {
      get(endpoint)
        .then(json => json.data.children)
        .then(messages => {
          if (messages.length > 0) {
            // This call returned messages, add them to the list.
            messagesList = messagesList.concat(messages);

            if (messages.length < limit) {
              // This call returned less than the number we asked for,
              // which means we've reached the end of the messages.
              // We don't have to recurse anymore.
              resolve(messagesList);
            }
            else {
              // We don't know if there are more messages or not,
              // we must query for the next batch.
              const lastMessageId = messages[messages.length - 1]['data']['name'];
              resolve(getMessages(lastMessageId, messagesList));
            }
          }
          else {
            // We did not get any messages back from this query.
            resolve(messagesList);
          }
        })
        .catch(() => {
          // There was an error executing this query.
          resolve(messagesList);
        });
    });
  }

  // Get all the messages from the inbox before proceeding.
  getMessages()
    .then((messages) => {
      // Run filter logic against the entire list of messages.
      messages
        .filter(data => data['kind'] === 't4')
        .map(data => data['data'])
        .map (message => message['subject'].match(/^You\'ve been banned from participating in r\/(.+)$/i))
        .filter(match => match !== null)
        .map(match => match[1])
        .forEach(subreddit => helper.log("- " + subreddit));
    });
}

function getRedditComments(subreddit) {
  return get("https://www.reddit.com/r/" + subreddit + "/comments.json?limit=100&raw_json=1")
    .then(json => json.data.children)
    .then((comments) => {
      if (!comments) {
        return;
      }

      const lastProcessedIndex = comments.findIndex((el) => {
        return el['data']['name'] === lastProcessedCommentId;
      });
      if (lastProcessedIndex !== -1) {
        comments = comments.slice(0, lastProcessedIndex)
      }

      const unprocessedComments = comments
        .map(comment => comment['data'])
        .map(data => {
          return {
              'body': data['body'],
              'author': data['author'],
              'id': data['name'],
              'postTitle': data['link_title'],
              'link': data['link_permalink'] + data['id'],
              'subreddit': data['subreddit'],
              'timestamp' : data['created_utc']
            }
        });

      lastProcessedCommentId = comments[0] ? comments[0]['data']['name'] : lastProcessedCommentId;
      return unprocessedComments;
    });
}

function postComment(parentId, markdownBody) {
  return post('/api/comment', { 'parent' : parentId, 'text' : markdownBody });
}

function getComment(commentId) {
  return get('https://www.reddit.com/api/info.json?id=' + commentId)
    .then(json => json.data.children)
    .then(comment => {
      if (comment.length == 0) {
        return;
      }

      const data = comment[0]['data'];

      return {
        'body': data['body'],
        'author': data['author'],
        'id': data['name'],
        'link_id' : data['link_id'],
        'postTitle': '', // api/info does not return a value for postTitle but this property is required by shouldConvertComment
        'subreddit': data['subreddit'],
        'timestamp' : data['created_utc']
      }
    });
}

function editComment(commentId, markdownBody) {
  return post('/api/editusertext', { 'thing_id' : commentId, 'text' : markdownBody });
}

function getCommentReplies(linkId, commentId) {
  return get('https://www.reddit.com/api/morechildren.json?api_type=json&link_id=' + linkId + '&children=' + commentId.replace(/t1_/g, '') + '&depth=1')
    .then((replies) => {
      if (replies.length === 0) {
        return [];
      }
      return replies['json']['data']['things'];
    });
}

function getUnreadMessages() {
  return get("/message/unread?limit=100")
    .then(json => json.data.children);
}

function markAllMessagesAsRead() {
  return post('/api/read_all_messages');
}

function blockAuthorOfMessageWithId(id) {
  return post("/api/block", { 'id' : id });
}

module.exports = {
  "refreshToken" : refreshToken,
  "getRedditComments" : getRedditComments,
  "getComment" : getComment,
  "postComment" : postComment,
  "editComment" : editComment,
  "getCommentReplies" : getCommentReplies,
  "getUnreadMessages" : getUnreadMessages,
  "markAllMessagesAsRead" : markAllMessagesAsRead,
  "blockAuthorOfMessageWithId" : blockAuthorOfMessageWithId
}
