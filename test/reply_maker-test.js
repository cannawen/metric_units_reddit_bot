const assert = require('assert');
const should = require('chai').should();

const replier = require('../src/reply_maker');

describe('reply_maker', () => {
  describe('#formatReply()', () => {
    it('should create a tabular response for 1 conversion', () => {
      replier.formatReply({ 'subreddit': 'all' }, {"foo" : "bar"})
        .should
        .include("foo | bar ");
    });

    it('should create tabular response for 2 conversions', () => {
      replier.formatReply({ 'subreddit': 'all' }, {"foo" : "bar", "hi" : "hey"})
        .should
        .include("foo | bar  \n")
        .and
        .include("hi | hey ");
    });

    it('should create tabular response of supersets of text', () => {
      replier.formatReply({ 'subreddit': 'all' }, {"foo" : "bar", "foobar" : "hey", "cat":"dog"})
        .should
        .include("foo | bar  \n")
        .and
        .include("foobar | hey  \n")
        .and
        .include("cat | dog ");
    });

    it('should say metric units bot on normal subreddits', () => {
      replier.formatReply({ 'subreddit': 'all' }, {})
        .should
        .include("^metric ^units ^bot")
    });

    it('should say metric units human on totallynotrobots', () => {
      replier.formatReply({ 'subreddit': 'totallynotrobots' }, {})
        .should
        .include("^METRIC ^UNITS ^~~BOT~~ ^HUMAN")
    });
  });
});
