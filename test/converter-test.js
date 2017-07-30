const assert = require('assert');
const should = require('chai').should();

const converter = require('../converter');

describe('Converter', () => {
  describe('#convertString()', () => {

    context('Has distance to convert', () => {
      it('should convert while keeping context', () => {
        converter.shouldConvert("I would walk 10000 miles").should.equal(true);

        converter.convertString("I would walk 10000 miles").should.equal("I would walk **16093 kilometers**");
        converter.convertString("I would walk 10000miles").should.equal("I would walk **16093kilometers**");
      });

      it('should convert distances less than 5 miles with more accuracy', () => {
        converter.shouldConvert("2 miles").should.equal(true);
        converter.convertString("2 miles").should.equal("**3.2 kilometers**");
      });

      it('should convert decimal miles with similar precision', () => {
        converter.shouldConvert("6.789 miles").should.equal(true);
        converter.convertString("6.789 miles").should.equal("**10.926 kilometers**");
      });

      it('should convert numbers with commas', () => {
        converter.shouldConvert("999,000 miles").should.equal(true);
        converter.convertString("999,123,456 miles").should.equal("**1,607,933,339 kilometers**");
      });

      it('should convert comma and decimal numbers', () => {
        converter.shouldConvert("around 1,000.4 miles or so").should.equal(true);
        converter.convertString("around 1,000.4 miles or so").should.equal("around **1,610 kilometers** or so");
      });
    });

    context('Has no distance to convert', () => {
      it('should not convert with no number', () => {
        converter.shouldConvert("some miles").should.equal(false);
      });

      it('should not convert kilometers', () => {
        converter.shouldConvert("800 kilometers").should.equal(false);
        converter.shouldConvert("800km").should.equal(false);
      });

      it('should not convert deformed numbers', () => {
        converter.shouldConvert("1,10,2 miles").should.equal(false);
      });
    });

    context('Has temperature to convert', () => {
      it('should convert while keeping context', () => {
        converter.shouldConvert("It's 32F outside").should.equal(true);

        converter.convertString("It's 32F outside").should.equal("It's **0C** outside");
        converter.convertString("It's cold (-40 °F) outside").should.equal("It's cold (**-40 °C**) outside");
        converter.convertString("It's about ~32 F outside").should.equal("It's about ~**0 C** outside");
        converter.convertString("It's >32F outside").should.equal("It's >**0C** outside");
        converter.convertString("It's <32°F outside").should.equal("It's <**0°C** outside");
      });

      it('should convert without a degree symbol (32F)', () => {
        converter.shouldConvert("32F").should.equal(true);
        converter.convertString("32F").should.equal("**0C**");
      });

      it('should convert with a degree symbol (32˚F or 32°F)', () => {
        converter.shouldConvert("32˚F").should.equal(true);
        converter.convertString("32˚F").should.equal("**0˚C**");

        converter.shouldConvert("32°F").should.equal(true);
        converter.convertString("32°F").should.equal("**0°C**");
      });

      it('should convert negative temperatures (-32F)', () => {
        converter.shouldConvert("-32F").should.equal(true);
        converter.convertString("-32F").should.equal("**-36C**");
      });

      it('should convert with a space (32 F)', () => {
        converter.shouldConvert("32 F").should.equal(true);
        converter.convertString("32 F").should.equal("**0 C**");
      });

      it('should convert negative temperatures with a space and degree symbol (-32 ˚F)', () => {
        converter.shouldConvert("-32 ˚F").should.equal(true);
        converter.convertString("-32 ˚F").should.equal("**-36 ˚C**");
      });

      it('should convert all temperatures in a string', () => {
        converter.shouldConvert("32 F, -32°F").should.equal(true);
        converter.convertString("32 F, -32°F").should.equal("**0 C**, **-36°C**");
      });

      it('should convert temperature ranges', () => {
        converter.shouldConvert("32 - -32°F").should.equal(true);
        converter.shouldConvert("32-32F").should.equal(true);

        converter.convertString("32 - -32°F").should.equal("**0 to -36°C**");
        converter.convertString("(32-32F)").should.equal("(**0 to 0C**)");
      });

    });

    context('No temperature to convert', () => {
      it('should not convert celcius', () => {
        converter.shouldConvert("It's **32˚C** outside").should.equal(false);
      });

      it('should not convert mid-string', () => {
        converter.shouldConvert("A7F").should.equal(false);
        converter.shouldConvert("8FF").should.equal(false);
      });
    });
  });
});