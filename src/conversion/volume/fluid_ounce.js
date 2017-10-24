const shared = require('../shared');
const volume = require('./_volume');
const rh = require('../../regex_helper');

const liquidKeywords = ['liquids?', 'water', 'teas?', 'beers?', 'sodas?', 'pops?', 'colas?', 'ciders?', 'juices?', 'coffees?', 'liquors?', 'milk', 'bottles?', 'spirits?', 'rums?', 'vodkas?', 'tequilas?', 'wines?', 'oils?', "cups?", "cans?", "tall boys?", "brews?", "breastfeeding", "breastfee?d", "pints?", "bartends?", "bartending", "flow", "paint", "retarder", "thinner", "primer", "wash", "acrylic", "paste"];

module.exports = {
  "imperialUnits" : [/(?:liquid|fluid|fl\.?)[ -]?(?:oz|ounces?)/,
                     /(?:oz\.?|ounces?)[ -]?(?:liquid|fluid|fl)/],
  "standardInputUnit" : " fl. oz.",
  "isInvalidInput" : shared.isZeroOrNegative,
  "isWeaklyInvalidInput" : shared.isHyperbole,
  "conversionFunction" : (i) => volume.toMap(i, (j) => j * 0.0295735295625),
  "ignoredUnits" : volume.metricUnits,
  "ignoredKeywords" : shared.ukSubreddits,
  "preprocess" : (comment) => {
    const input = comment['body'];
    const ozRegex = new RegExp(( rh.startRegex 
        + rh.numberRegex
        + "[- ]?"
        + rh.regexJoinToString([/oz/, /ounces?/])
      ),'gi');
    const ozAndLiquidRegex = new RegExp(( ozRegex.source
        + ".+?\\b"
        + rh.regexJoinToString(liquidKeywords)
      ),'i');

    if (!ozAndLiquidRegex.test(input)) {
      return input;
    }

    return input.replace(ozRegex, (oz, offset, string) => {
      return " " + oz + " fl. oz";
    });
  }
}
