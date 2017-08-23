const should = require('chai').should();

const helper = require('../src/regex_helper');

describe('Regex helper', () => {
  describe('#roundToDecimalPlaces()', () => {
    it('should round with significant digits', () => {
      helper.roundToDecimalPlaces(5.5, 2).should.equal("5.50");
    });
  });
});