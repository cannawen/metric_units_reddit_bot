const assert = require('assert');
const should = require('chai').should();

const replier = require('../src/reply_maker');

describe('reply_maker', () => {
  describe('#formatReply()', () => {
    it('should create a tabular response for 1 conversion', () => {
      replier.formatReply("Test foo", {"foo" : "bar"})
        .should
        .include("foo | bar ");
    });

    it('should create tabular response for 2 conversions', () => {
      replier.formatReply("Hello there foo how are you meep merp Hello there!", {"foo" : "bar", "hi" : "hey"})
        .should
        .include("foo | bar  \n")
        .and
        .include("hi | hey ");
    });

    it('should create tabular response of supersets of text', () => {
      replier.formatReply("Test foobar foo cat cat", {"foo" : "bar", "foobar" : "hey", "cat":"dog"})
        .should
        .include("foo | bar  \n")
        .and
        .include("foobar | hey  \n")
        .and
        .include("cat | dog ");
    });
  });
});
