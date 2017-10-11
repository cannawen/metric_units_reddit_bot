// NPM imports.
const assert = require('assert');
const chai = require('chai');
const should = chai.should();
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const proxyquire =  require('proxyquire');

// Members / Local imports.
let error, response;
const network = proxyquire('../src/network', {
  'request': (options, callback) => {
    callback(error, response);
  },
});

/*
 * The Tests.
 */
describe('network', () => {
  // Test Hooks.
  beforeEach(() => {
    error = null;
    response = {};
  });

  describe('#refreshToken()', () => {
    /*
     * Unfortunately, the order of the refreshToken() tests does matter.
     * This is due to the network module maintaining internal state,
     * specifically oauthTokenValidUntil.
     */

    it('should reject on error', () => {
      error = true;
      return network.refreshToken().should.be.rejected;
    });

    it('should resolve on success', () => {
      response.body = JSON.stringify({ access_token: 'unit_test' });
      return network.refreshToken().should.be.fulfilled;
    });

    it('should resolve when token is still valid', () => {
      return network.refreshToken().should.be.fulfilled;
    });
  });

  describe('#getUnreadMessages()', () => {
    it('should succeeed', () => {
      const testObj = {
        data: {
          children: {
            unit: 'test'
          }
        }
      };
      response.body = JSON.stringify(testObj);
      return network.getUnreadMessages().should.eventually.deep.equal(testObj.data.children);
    });
  });

  describe('#getCommentReplies()', () => {
    it('should succeed', () => {
      const testObj = { data: { children: { json: { data: { things: 99 }}}}};
      response.body = JSON.stringify(testObj);
      return network.getCommentReplies().should.eventually.deep.equal(testObj.data.children.json.data.things);
    });

    it('should return empty array when no replies', () => {
      response.body = JSON.stringify({ data: { children: []}});
      return network.getCommentReplies().should.eventually.deep.equal([]);
    });
  });

  describe('#getComment()', () => {
    it('should succeed', () => {
      const test = { data: { children: [{
        data: {
          body: 'body',
          author: 'author',
          name: 'name',
          link_id: 'link_id',
          subreddit: 'subreddit',
          created_utc: 'created_utc',
        }
      }]}};
      response.body = JSON.stringify(test);
      return network.getComment('test').should.eventually.deep.equal({
        body: 'body',
        author: 'author',
        id: 'name',
        link_id: 'link_id',
        postTitle: '',
        subreddit: 'subreddit',
        timestamp: 'created_utc',
      });
    });

    it('should succeed when no results', () => {
      const test = { data: { children: []}};
      response.body = JSON.stringify(test);
      return network.getComment('test').should.eventually.deep.equal(undefined);
    });
  });

  describe('#getRedditComments()', () => {
    it('should succeed when no results', () => {
      const test = { data: { children: null }};
      response.body = JSON.stringify(test);
      return network.getRedditComments('test').should.eventually.deep.equal(undefined);
    });

    it('should suceed', () => {
      const test = { data: { children: [{
        data: {
          body: 'body',
          author: 'author',
          name: 'name',
          link_title: 'link_title',
          link_permalink: 'link_permalink',
          id: 'id',
          subreddit: 'subreddit',
          created_utc: 'created_utc',
        }
      }]}};
      response.body = JSON.stringify(test);
      return network.getRedditComments('test').should.eventually.deep.equal([{
        body: 'body',
        author: 'author',
        id: 'name',
        postTitle: 'link_title',
        link: 'link_permalinkid',
        subreddit: 'subreddit',
        timestamp: 'created_utc',
      }]);
    });

    it('should not process previously processed comments', () => {
      const first = { data: { children: [{ data: { name: 'first_processed' }}]}};
      response.body = JSON.stringify(first);
      return network.getRedditComments('test')
        .then(() => {
          // We don't actually care about the results from the first call,
          // we're just using it to set lastProcessedCommentId.
          // We want to test that that one gets skipped on subsequent calls.
          const second = { data: { children: [
            {
              data: {
                name: 'first_processed',
              }
            }, {
              data: {
                name: 'second_processed',
              }
            }
          ]}};
          response.body = JSON.stringify(second);
          return network.getRedditComments('test').should.eventually.have.length(1);
        });
    });
  });

  /*
   * The "post" tests aren't the greatest because post() early outs during unit testing.
   * You can visually inspect the call params in the console.
   */
  describe('#postComment()', () => {
    it('should succeed', () => {
      return network.postComment('id', 'body').should.eventually.equal(undefined);
    });
  });

  describe('#editComment()', () => {
    it('should succeed', () => {
      return network.editComment('id', 'body').should.eventually.equal(undefined);
    });
  });

  describe('#markAllMessagesAsRead()', () => {
    it('should succeed', () => {
      return network.markAllMessagesAsRead().should.eventually.equal(undefined);
    });
  });

  describe('#blockAuthorOfMessageWithId()', () => {
    it('should succeed', () => {
      return network.blockAuthorOfMessageWithId('id').should.eventually.equal(undefined);
    });
  });
});
