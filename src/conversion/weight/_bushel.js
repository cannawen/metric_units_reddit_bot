//Temporarily disabled because of _ in name of file

const shared = require('../shared');
const weight = require('./_weight');

module.exports = {
  "imperialUnits" : [/bushels?/],
  "standardInputUnit" : " bushels",
  "isInvalidInput" : shared.isZeroOrNegative,
  "isWeaklyInvalidInput" : shared.isHyperbole,
  "conversionFunction" : (i) => weight.toMap(i, (j) => j * 35239.07040000007),
  "ignoredUnits" : weight.metricUnits
}
