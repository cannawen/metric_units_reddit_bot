const shared = require('../shared');
const weight = require('./_weight');
const rh = require('../../regex_helper');

module.exports = {
  "imperialUnits" : ["lbs?"],
  "weakImperialUnits" : [/pounds?/],
  "standardInputUnit" : " lb",
  "isInvalidInput" : shared.isZeroOrNegative,
  "isWeaklyInvalidInput" : shared.isHyperbole,
  "conversionFunction" : (i) => weight.toMap(i, (j) => j * 453.592),
  "ignoredUnits" : weight.metricUnits,
  "ignoredKeywords" : ["football", "soccer", "fifa", "bowling"],
  "preprocess" : (comment) => {
    const input = comment['body']
    const lbAndOz = 
      new RegExp(( rh.startRegex 
        + rh.numberRegex
        + "[- ]?"
        + rh.regexJoinToString([/lbs?/, /pounds?/])
        + "[- ]?"
        + rh.numberRegex
        + "[- ]?"
        + rh.regexJoinToString([/oz/, /ounces?/])
      ),'gi');
    return input.replace(lbAndOz, (match, lb, oz, offset, string) => {
      const ozLessThan16 = Number(oz) <= 16;
      if (ozLessThan16) {
        const lbNumeral = shared.roundToDecimalPlaces(Number(lb.replace(/[^\d-\.]/g, '')) + Number(oz)/16, 2);
        return " " + lbNumeral + " lb ";
      } else {
        return "  ";
      }
    });
  },
  "postprocessInput" : (numbers) => {
    if (numbers.every((input) => input.toString().indexOf('.') == -1)) {
      return numbers.map(function(input, index) {
        if(index == numbers.length-1) {
          return rh.addCommas(input) + " lb"
        } else {
          return rh.addCommas(input);
        }
      });
    } else {
      return numbers.map((input) => rh.addCommas(Math.floor(input).toString()) + " lb " 
             + shared.roundToDecimalPlaces(input%1 * 16, 0) + " oz");
    }
  }
}