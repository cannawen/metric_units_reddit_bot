const shared = require('../shared');
const distance = require('./_distance');

module.exports = {
  "imperialUnits" : [/furlongs?/],
  "weakImperialUnits" : [/fur/],
  "standardInputUnit" : " furlongs",
  "isInvalidInput" : shared.isZeroOrNegative,
  "isWeaklyInvalidInput" : shared.isHyperbole,
  "conversionFunction" : (i) => distance.toMap(i, (j) => j * 201.168),
  "ignoredUnits" : distance.metricUnits
}
