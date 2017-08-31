const assert = require('assert');
const should = require('chai').should();
const proxyquire =  require('proxyquire')

describe('Bot', () => {
  let bot;

  //Network
  let refreshTokenCalled;
  let getRedditCommentsParam;
  let getRedditCommentsReturnValue;
  let postCommentId;
  let postCommentBody;

  //Helper
  let commentFunction;
  let commentSeconds;
  let directMessageFunction;
  let directMessageSeconds;

  //Converter
  let conversionCommentParam;
  let conversionReturnValue;

  //Replier
  let replyCommentParam;
  let replyConversionParam;
  let replyReturnValue;

  beforeEach(() => {
    let helperStub = {};
    let networkStub = {};
    let converterStub = {};
    let replyStub = {};

    //Network
    refreshTokenCalled = false;
    networkStub.refreshToken = () => { 
      refreshTokenCalled = true;
    };
    getRedditCommentsParam = undefined;
    networkStub.getRedditComments = (param) => { 
      getRedditCommentsParam = param;
      return getRedditCommentsReturnValue;
    };
    postCommentId = undefined;
    postCommentBody = undefined;
    networkStub.postComment = (id, body) => {
      postCommentId = id;
      postCommentBody = body;
    }

    //Helper
    commentFunction = undefined;
    commentSeconds = undefined;
    directMessageFunction = undefined;
    directMessageSeconds = undefined;
    helperStub.setIntervalSafely = (f, seconds) => { 
      if (commentFunction === undefined) {
        commentFunction = f;
        commentSeconds = seconds;
      } else {
        directMessageFunction = f;
        directMessageSeconds = seconds;
      }
    };

    //Converter
    conversionCommentParam = undefined;
    conversionReturnValue = undefined;
    converterStub.conversions = (comment) => {
      conversionCommentParam = comment;
      return conversionReturnValue;
    };

    //Replier
    replyCommentParam = undefined;
    replyConversionParam = undefined;
    replyReturnValue = undefined;
    replyStub.formatReply = (comment, conversions) => {
      replyCommentParam = comment;
      replyConversionParam = conversions;
      return replyReturnValue;
    }

    bot = proxyquire('../src/bot', { 
      './helper': helperStub,
      './network' : networkStub,
      './converter' : converterStub,
      './reply_maker' : replyStub,
      './analytics' : { trackConversion: (x) => x }
    });
  });

  describe('on load', () => {
    it('should refresh network token', () => {
      refreshTokenCalled.should.equal(true);
    });
  });

  describe('reply to comment', () => {
    it('should happen every 2 seconds', () => {
      commentSeconds.should.equal(2);
    });

    context('on trigger', () => {
      it('should get reddit comments to r/all', () => {
        commentFunction();
        getRedditCommentsParam.should.equal("all");
      });

      context('given valid comment', () => {
        let comment;

        beforeEach(() => {
          comment = {
            'body': 'comment 1',
            'author': '',
            'id': '123',
            'postTitle': '',
            'link': '',
            'subreddit': '',
            'timestamp' : ''
          }
          getRedditCommentsReturnValue = [comment];
          conversionReturnValue = {"1" : "2"};
        });

        it('should create conversion', () => {
          commentFunction();
          conversionCommentParam.should.equal(comment);
        });

        context('given valid conversion', () => {
          beforeEach(() => {
            replyReturnValue = 'comment 1 converts to comment 2'
          });

          it('should create reply', () => {
            commentFunction();
            replyCommentParam.should.equal(comment);
            replyConversionParam.should.equal(conversionReturnValue);
          });

          it('should post reply', () => {
            commentFunction();
            postCommentId.should.equal('123');
            postCommentBody.should.equal(replyReturnValue);
          });
        });
      });
    });
  });
});
