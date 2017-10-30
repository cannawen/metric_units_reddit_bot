const shared = require('../shared_conversion_functions');
const weight = require('./_weight');
const rh = require('../../regex_helper');

module.exports = {
  "imperialUnits" : [/ozt/, /oz t/, /troy ounces?/],
  "standardInputUnit" : " troy ounces",
  "isInvalidInput" : shared.isZeroOrNegative,
  "isWeaklyInvalidInput" : shared.isHyperbole,
  "conversionFunction" : (i) => weight.toMap(i, (j) => j * 31.1034768),
  "ignoredUnits" : weight.metricUnits,
  "preprocess" : (comment) => {
    const input = comment['body'];
    const specialSubredditsRegex = new RegExp(
        rh.regexJoinToString([/silverbugs/, /pmsforsale/, /coins/]),'gi');
    const unitRegex = new RegExp(( rh.startRegex
          + rh.numberRegex
          + "[- ]?"
          + rh.regexJoinToString([/oz/, /ounces?/])
          ),'gi');

    if (specialSubredditsRegex.test(comment['subreddit'])) {
      return input.replace(unitRegex, (match, oz, offset, string) => {
        return " " + oz + " troy ounces ";
      });
    }
    return input;
  }
}