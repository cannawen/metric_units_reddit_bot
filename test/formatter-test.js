const assert = require('assert');
const should = require('chai').should();

const formatter = require('../src/formatter');

describe('Formatter', () => {
  describe('#formatReply()', () => {
    it('should create a tabular response for 1 conversion', () => {
      formatter.formatReply("Test foo", {"foo" : "bar"})
        .should
        .include("Original measurement | Metric measurement\n---|---\n")
        .and
        .include("foo|bar\n");
    });

    it('should create tabular response for 2 conversions', () => {
      formatter.formatReply("Hello there foo how are you meep merp Hello there!", {"foo" : "bar", "hi" : "hey"})
        .should
        .include("Original measurement | Metric measurement\n---|---\n")
        .and
        .include("foo|bar\n")
        .and
        .include("hi|hey\n");
    });

    it('should create tabular response of supersets of text', () => {
      formatter.formatReply("Test foobar foo cat cat", {"foo" : "bar", "foobar" : "hey", "cat":"dog"})
        .should
        .include("Original measurement | Metric measurement\n---|---\n")
        .and
        .include("foo|bar\n")
        .and
        .include("foobar|hey\n")
        .and
        .include("cat|dog\n");
    });
  });
});