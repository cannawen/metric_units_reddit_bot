const shared = require('../shared_conversion_functions');
const weight = require('./_weight');

module.exports = {
  "imperialUnits" : [/oz/, /ounces?/],
  "standardInputUnit" : " oz",
  "isInvalidInput" : shared.isZeroOrNegative,
  "isWeaklyInvalidInput" : shared.isHyperbole,
  "conversionFunction" : (i) => weight.toMap(i, (j) => j * 28.3495),
  "ignoredUnits" : ["oz t", "ozt"].concat(weight.metricUnits),
  "ignoredKeywords" : ["leather", "rawdenim"].concat(shared.ukSubreddits)
}