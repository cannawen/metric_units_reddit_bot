const shared = require('../shared_conversion_functions');
const volume = require('./_volume');

module.exports =  {
  "imperialUnits" : [/teaspoons?/, /tsp/],
  "standardInputUnit" : " tsp",
  "isInvalidInput" : shared.isZeroOrNegative,
  "isWeaklyInvalidInput" : shared.isHyperbole,
  "conversionFunction" : (i) => volume.toMap(i, (j) => j * 0.00492892),
  "ignoredUnits" : volume.metricUnits
}