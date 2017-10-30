const shared = require('../shared_conversion_functions');
const distance = require('./_distance');
const rh = require('../../regex_helper');

module.exports = {
  "imperialUnits" : [/feet/, /ft/, /foot/],
  "weakImperialUnits" : [/[']/],
  "standardInputUnit" : " feet",
  "isInvalidInput" : shared.isZeroOrNegative,
  "isWeaklyInvalidInput" : (i) => shared.isHyperbole(i) || [1, 2, 4, 6].indexOf(i) !== -1,
  "conversionFunction" : (i) => distance.toMap(i, (j) => j * 0.3048),
  "ignoredUnits" : distance.metricUnits,
  "ignoredKeywords" : ["size", "pole"],
  "preprocess" : (comment) => {
    const input = comment['body'];
    const feetAndInchesRegex = 
      new RegExp(( rh.startRegex 
        + rh.numberRegex
        + "[- ]?"
        + rh.regexJoinToString(["[\']", "ft", /feet/, /foot/])
        + "[- ]?"
        + rh.numberRegex
        + "[- ]?"
        + rh.regexJoinToString([/["]/, /in/, /inch/, /inches/])
      ),'gi');
    return input.replace(feetAndInchesRegex, (match, feet, inches, offset, string) => {
      const inchesLessThan12 = inches <= 12;
      const inchesLessThan3CharactersBeforeDecimal = inches
          .toString()
          .split('.')[0]
          .replace(/[^\d\.]/,'')
          .length <= 2
      if (inchesLessThan12 && inchesLessThan3CharactersBeforeDecimal) {
        const feetNumeral = shared.roundToDecimalPlaces(Number(feet.replace(/[^\d-\.]/g, '')) + Number(inches)/12, 2);
        return " " + feetNumeral + " feet ";
      } else {
        return "  ";
      }
    });
  },
  "postprocessInput" : (numbers) => {
    if (numbers.every((input) => input.toString().indexOf('.') == -1)) {
      return numbers.map(function(input, index) {
        if(index == numbers.length-1) {
          return rh.addCommas(input) + " feet"
        } else {
          return rh.addCommas(input);
        }
      });
    } else {
      return numbers.map((input) => rh.addCommas(Math.floor(input).toString()) + "'" 
              + shared.roundToDecimalPlaces(input%1 * 12, 0) + "\"");
    }
  },
}