const should = require('chai').should();

const map = require('../src/units_lookup_map');

describe('Units lookup map', () => {
  describe('feet to metres', () => {
    describe('preprocess', () => {
      const preprocess = map.unitsLookupMap['feet to metres']['preprocess'];

      it('should turn feet and inches into feet', () => {
        const input = " 1'2\"  3 foot 4 inches  5ft6in  7-feet-8-in  9' 10.5\"  11'12\"  13ft1  400'0"
        preprocess(input).should
          .include("1.17 feet")
          .and.include("3.33 feet")
          .and.include("5.50 feet")
          .and.include("7.67 feet")
          .and.include("9.88 feet")
          .and.include("12.00 feet")
          .and.include("13.08 feet")
          .and.include("400.00 feet");
      });


      it('should not convert values that are not feet and inches', () => {
        const input = " 12'000 or 2004-'05 ";
        preprocess(input).should
          .not.include("12.00 feet")
          .not.include("4.42 feet");
      });
    });
  });
});