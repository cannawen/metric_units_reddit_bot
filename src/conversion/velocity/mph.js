const shared = require('../shared_conversion_functions');
const velocity = require('./_velocity');

module.exports = {
  "imperialUnits" : [/mph/, /miles (?:an|per) hour/],
  "standardInputUnit" : " mph",
  "isInvalidInput" : shared.isZeroOrNegative,
  "isWeaklyInvalidInput" : (i) => shared.isHyperbole(i) || [60, 88].indexOf(i) !== -1,
  "conversionFunction" : (i) => velocity.toMap(i, (j) => j * 0.44704),
  "ignoredUnits" : velocity.metricUnits,
  "ignoredKeywords" : shared.ukSubreddits
}
