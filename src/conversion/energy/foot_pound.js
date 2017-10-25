const shared = require('../shared_conversion_functions');
const energy = require('./_energy');

module.exports = {
  "imperialUnits" : [/(?:foot|ft)[ -·]?(?:pounds?|lbf?|lbs?)/, /(?:pounds?|lbs?)[ -·]?(?:foot|fts?)/],
  "standardInputUnit" : " ft·lbf",
  "isInvalidInput" : shared.isZeroOrNegative,
  "isWeaklyInvalidInput" : shared.isHyperbole,
  "conversionFunction" : (i) => energy.toMap(i, (j) => j * 1.355818),
  "ignoredUnits" : energy.metricUnits
}