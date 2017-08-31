const assert = require('assert');
const should = require('chai').should();
const proxyquire =  require('proxyquire')

describe('Bot', () => {
  let bot;

  //Network
  let refreshTokenCount;
  let getRedditCommentsParam;
  let getRedditCommentsReturnValue;
  let postCommentId;
  let postCommentBody;
  let getUnreadMessagesReturnValue;
  let getUnreadMessagesCalled;
  let markAllMessagesAsReadCalled;

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

  //Sass
  let sassMessageParam;
  let sassRetunValue;

  beforeEach(() => {
    let helperStub = {};
    let networkStub = {};
    let converterStub = {};
    let replyStub = {};
    let sassStub = {};

    //Network
    refreshTokenCount = 0;
    networkStub.refreshToken = () => { 
      refreshTokenCount = refreshTokenCount + 1;
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
    };
    getUnreadMessagesCalled = false;
    getUnreadMessagesReturnValue = undefined;
    networkStub.getUnreadMessages = () => {
      getUnreadMessagesCalled = true;
      return getUnreadMessagesReturnValue
    };
    markAllMessagesAsReadCalled = false;
    networkStub.markAllMessagesAsRead = () => {
      markAllMessagesAsReadCalled = true;
    };

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

    //Sass
    sassMessageParam = undefined;
    sassRetunValue = undefined;
    sassStub.reply = (message) => {
      sassMessageParam = message;
      return sassRetunValue;
    }

    bot = proxyquire('../src/bot', { 
      './helper': helperStub,
      './network' : networkStub,
      './converter' : converterStub,
      './reply_maker' : replyStub,
      './analytics' : { trackConversion: (x) => x,
                        trackSass: (x) => x,
                        trackUnsubscribe: (x) => x },
      './sass' : sassStub
    });
  });

  describe('on load', () => {
    it('should refresh network token', () => {
      refreshTokenCount.should.equal(1);
    });
  });

  describe('conversions', () => {
    it('should trigger every 2 seconds', () => {
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

  describe('personality', () => {
    it('should trigger every 60 seconds', () => {
      directMessageSeconds.should.equal(60);
    });

    context('on trigger', () => {
      it('should refresh network token', () => {
        directMessageFunction();
        refreshTokenCount.should.equal(2);
      });

      it('should get all unread messages', () => {
        directMessageFunction();
        getUnreadMessagesCalled.should.equal(true);
      });

      context('valid message', () => {
        let message;

        beforeEach(() => {
          message = {
            'kind' : 't1',
            'data' : {
              'body' : 'good bot',
              'name' : '456',
              'subreddit' : '',
              'subject' : ''
            }
          };
          getUnreadMessagesReturnValue = [message];
        });

        it('should mark all messages as read', () => {
          directMessageFunction();
          markAllMessagesAsReadCalled.should.equal(true);
        });

        it('should make sassy response', () => {
          sassRetunValue = 'sassy response';
          directMessageFunction();
          sassMessageParam['body'].should.equal('good bot');
          postCommentId.should.equal('456');
          postCommentBody.should.equal(sassRetunValue);
        });
      });
    });
  });
});
