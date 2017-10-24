const shared = require('../shared');
const area = require('./_area');

module.exports = {
    "imperialUnits" : [/acres?/],
    "standardInputUnit" : " acres",
    "isInvalidInput" : shared.isZeroOrNegative,
    "isWeaklyInvalidInput" : shared.isHyperbole,
    "conversionFunction" : (i) => area.toMap(i, (j) => j * 4046.8564),
    "ignoredUnits" : area.metricUnits
  }