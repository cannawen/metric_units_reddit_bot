const assert = require('assert');
const should = require('chai').should();

const converter = require('../converter');

describe('Converter', () => {
  describe('#convertString()', () => {

    context('Has temperature to convert', () => {
      it('should convert', () => {
        converter.shouldConvert("It's 32˚F outside").should.equal(true);
      });

      it('should convert F to C', () => {
        converter.convertString("It's 32˚F outside").should.equal("It's 0˚C outside");
      });
    });

    context('No temperature to convert', () => {
      it('should not convert', () => {
        converter.shouldConvert("It's 32˚C outside").should.equal(false);
      });

      it('should not convert string', () => {
        converter.convertString("It's 32˚C outside").should.equal("It's 32˚C outside");
      });
    });

  });
});