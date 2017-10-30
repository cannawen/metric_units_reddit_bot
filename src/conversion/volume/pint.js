const shared = require('../shared_conversion_functions');
const volume = require('./_volume');

module.exports = {
  "imperialUnits" : [/pints?/],
  "standardInputUnit" : " pints",
  "isInvalidInput" : shared.isZeroOrNegative,
  "isWeaklyInvalidInput" : shared.isHyperbole,
  "conversionFunction" : (i) => volume.toMap(i, (j) => j * 0.473176),
  "ignoredUnits" : volume.metricUnits,
  "ignoredKeywords" : shared.ukSubreddits
}
