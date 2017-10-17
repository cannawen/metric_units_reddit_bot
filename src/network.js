const request = require('request');

const helper = require('./helper');

const environment = helper.environment();

let oauthAccessToken;
let oauthTokenValidUntil;
let lastProcessedCommentId;

/**
 * Makes a network request.
 * @param  {Object}   options      - The request options.
 * @param  {Boolean}  oauthRequest - Whether the request is an oauthRequest.
 * @return {Promise}  The promise of a response from the network request.
 */
function networkRequest(options, oauthRequest) {
  let inputOptions = options;
  function redditOauthHeader() {
    const userAgent =
      `script:${environment['reddit-username']}:${environment.version} (by: /u/${environment['reddit-username']})`;

    return {
      headers: {
        'User-Agent': userAgent,
      },
      auth: {
        bearer: oauthAccessToken,
      },
    };
  }

  if (oauthRequest) {
    inputOptions = Object.assign(redditOauthHeader(), inputOptions);
  }

  return new Promise((resolve, reject) => {
    request(inputOptions, (err, res) => {
      if (err) {
        console.error('network error:', err); // eslint-disable-line no-console
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

function get(url) {
  let requestPromise;

  if (url.startsWith('http')) {
    requestPromise = networkRequest({ url }, false);
  } else {
    requestPromise = networkRequest({ url: `https://oauth.reddit.com${url}` }, true);
  }

  return requestPromise
    .then(json => json.data.children);
}

function post(urlPath, form) {
  if (environment['dev-mode']) {
    helper.log(urlPath, form);
    return Promise.resolve();
  }

  return networkRequest({
    url: `https://oauth.reddit.com${urlPath}`,
    method: 'POST',
    form,
  }, true);
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
        pass: environment['oauth-secret'],
      },
      form: {
        grant_type: 'password',
        username: environment['reddit-username'],
        password: environment['reddit-password'],
      },
    }, (err, res) => {
      try {
        const json = JSON.parse(res.body);
        oauthAccessToken = json.access_token;
        oauthTokenValidUntil = helper.now() + (55 * 60 * 1000);
        resolve();
      } catch (e) {
        // console.error("oauth error:", e);
        oauthTokenValidUntil = 0;
        reject(e);
      }
    });
  });
}

function getRedditComments(subreddit) {
  return get(`https://www.reddit.com/r/${subreddit}/comments.json?limit=100&raw_json=1`)
    .then(json => json.data.children)
    .then((comments) => {
      if (!comments) {
        return null;
      }

      let inputComments = comments;
      const lastProcessedIndex =
        inputComments.findIndex(el => el.data.name === lastProcessedCommentId);
      if (lastProcessedIndex !== -1) {
        inputComments = inputComments.slice(0, lastProcessedIndex);
      }

      const unprocessedComments = inputComments
        .map(comment => comment.data)
        .map(data => ({
          body: data.body,
          author: data.author,
          id: data.name,
          postTitle: data.link_title,
          link: data.link_permalink + data.id,
          subreddit: data.subreddit,
          timestamp: data.created_utc,
        }));

      lastProcessedCommentId = comments[0] ? comments[0].data.name : lastProcessedCommentId;
      return unprocessedComments;
    });
}

function postComment(parentId, markdownBody) {
  return post('/api/comment', { parent: parentId, text: markdownBody });
}

function getComment(commentId) {
  return get(`https://www.reddit.com/api/info.json?id=${commentId}`)
    .then(json => json.data.children)
    .then((comment) => {
      if (comment.length === 0) {
        return null;
      }

      const { data } = comment[0];

      return {
        body: data.body,
        author: data.author,
        id: data.name,
        link_id: data.link_id,
        postTitle: '', // api/info does not return a value for postTitle but this property is required by shouldConvertComment
        subreddit: data.subreddit,
        timestamp: data.created_utc,
      };
    });
}

function editComment(commentId, markdownBody) {
  return post('/api/editusertext', { thing_id: commentId, text: markdownBody });
}

function getCommentReplies(linkId, commentId) {
  return get(`https://www.reddit.com/api/morechildren.json?api_type=json&link_id=${linkId}&children=${commentId.replace(/t1_/g, '')}&depth=1`)
    .then((replies) => {
      if (replies.length === 0) {
        return [];
      }
      return replies.json.data.things;
    });
}

function getUnreadMessages() {
  return get('/message/unread?limit=100')
    .then(json => json.data.children);
}

function markAllMessagesAsRead() {
  return post('/api/read_all_messages');
}

function blockAuthorOfMessageWithId(id) {
  return post('/api/block', { id });
}

module.exports = {
  refreshToken,
  getRedditComments,
  getComment,
  postComment,
  editComment,
  getCommentReplies,
  getUnreadMessages,
  markAllMessagesAsRead,
  blockAuthorOfMessageWithId,
};
