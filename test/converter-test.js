const assert = require('assert');
const should = require('chai').should();

const converter = require('../converter');

describe('Converter', () => {
  describe('#convertString()', () => {

    context('Has temperature to convert', () => {
      it('should convert 32˚F', () => {
        converter.shouldConvert("It's 32˚F outside").should.equal(true);
        converter.convertString("It's 32˚F outside").should.equal("It's 0˚C outside");
      });

      it('should convert 32F', () => {
        converter.shouldConvert("It's 32F outside").should.equal(true);
        converter.convertString("It's 32F outside").should.equal("It's 0C outside");
      });
    });

    context('No temperature to convert', () => {
      it('should not convert', () => {
        converter.shouldConvert("It's 32˚C outside").should.equal(false);
        converter.convertString("It's 32˚C outside").should.equal("It's 32˚C outside");
      });
    });

  });
});