const should = require('chai').should();
const pp = require('../src/preprocess');

function createComment(subreddit, title, body) {
  return {
    subreddit,
    title,
    body,
  };
}

describe('#preprocessComment()', () => {
  context('comment contains mixed', () => {
    it('should convert mixed values into decimals', () => {
      const comment = createComment('subredditname', 'post title', 'post text 10 5/7-miles');
      pp.preprocessComment(comment).body.should.equal('post text 10.71-miles');
    });
    it('should convert mixed values into decimals', () => {
      const comment = createComment('subredditname', 'post title', 'post text 1,707 05/09 miles more text');
      pp.preprocessComment(comment).body.should.equal('post text 1707.56 miles more text');
    });
    it('should convert mixed values into decimals', () => {
      const comment = createComment('subredditname', 'post title', 'post text 98 7654/3,210 inches');
      pp.preprocessComment(comment).body.should.equal('post text 100.38 inches');
    });
    it('should convert mixed values into decimals', () => {
      const comment = createComment('subredditname', 'post title', 'post text 5+18/09 inches');
      pp.preprocessComment(comment).body.should.equal('post text 7.00 inches');
    });
  });
  context('comment contains fraction', () => {
    it('should convert fractions into decimals', () => {
      const comment = createComment('subredditname', 'post title', 'post text 9/10-miles');
      pp.preprocessComment(comment).body.should.equal('post text 0.90-miles');
    });
    it('should convert fractions into decimals', () => {
      const comment = createComment('subredditname', 'post title', 'post text 177/100 miles more text');
      pp.preprocessComment(comment).body.should.equal('post text 1.77 miles more text');
    });
    it('should convert fractions into decimals', () => {
      const comment = createComment('subredditname', 'post title', 'post text 987,654/3210 inches');
      pp.preprocessComment(comment).body.should.equal('post text 307.68 inches');
    });
  });
  context('comment contains abbreviation', () => {
    it('should convert abbreviation into value', () => {
      const comment = createComment('test', 'post title', 'Something like 40k miles');
      pp.preprocessComment(comment).body.should.equal('Something like 40000 miles');
    });
    it('should convert abbreviation case-insensitively', () => {
      const comment = createComment('test', 'post title', 'Something like 40K miles');
      pp.preprocessComment(comment).body.should.equal('Something like 40000 miles');
    });
    it('should convert abbreviations if there is a space in between', () => {
      const comment = createComment('test', 'post title', 'Something like 40 k miles');
      pp.preprocessComment(comment).body.should.equal('Something like 40000 miles');
    });
    it('should convert multiple abbreviations', () => {
      const comment = createComment('test', 'post title', 'Somewhere between 30k and 40 thousand miles');
      pp.preprocessComment(comment).body.should.equal('Somewhere between 30000 and 40000 miles');
    });
    it('should convert numbers with decimals', () => {
      const comment = createComment('test', 'post title', 'I won 3.2mill at the lottery');
      pp.preprocessComment(comment).body.should.equal('I won 3200000 at the lottery');
    });
    it('should not convert abbreviations that are a part of a unit', () => {
      const kmComment = createComment('test', 'post title', 'The road is 30km long');
      const mphComment = createComment('test', 'post title', 'My car can do 100mph');

      pp.preprocessComment(kmComment).body.should.equal('The road is 30km long');
      pp.preprocessComment(mphComment).body.should.equal('My car can do 100mph');
    });
  });
});
