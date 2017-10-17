const assert = require('assert');
const should = require('chai').should();

const replier = require('../src/reply_maker');

describe('reply_maker', () => {
  describe('#formatReply()', () => {
    it('should create a tabular response for 1 conversion', () => {
      replier.formatReply({ subreddit: 'all' }, { foo: 'bar' })
        .should
        .include('foo ≈ bar\n\n');
    });

    it('should create tabular response for 2 conversions', () => {
      replier.formatReply({ subreddit: 'all' }, { foo: 'bar', hi: 'hey' })
        .should
        .include('foo ≈ bar  \n')
        .and
        .include('hi ≈ hey\n\n');
    });

    it('should create tabular response of supersets of text', () => {
      replier.formatReply({ subreddit: 'all' }, { foo: 'bar', foobar: 'hey', cat: 'dog' })
        .should
        .include('foo ≈ bar  \n')
        .and
        .include('foobar ≈ hey  \n')
        .and
        .include('cat ≈ dog\n\n');
    });

    it('should say metric units bot on normal subreddits', () => {
      replier.formatReply({ subreddit: 'all' }, {})
        .should
        .include('^metric ^units ^bot');
    });

    it('should say metric units human on totallynotrobots', () => {
      replier.formatReply({ subreddit: 'totallynotrobots' }, {})
        .should
        .include('^METRIC ^UNITS ^HUMAN');
    });

    it('should include footer links', () => {
      replier.formatReply({ subreddit: 'all', id: '101' }, { foo: 'bar' })
        .should
        .include('[^feedback](https://redd.it/73edn2)')
        .and
        .include('[^source](https://github.com/cannawen/metric_units_reddit_bot)')
        .and
        .include('[^block](https://www.reddit.com/message/compose')
        .and
        .include('[^refresh ^conversion](https://www.reddit.com/message/compose');
    });
  });
});
