const shared = require('../shared');
const volume = require('./_volume');

module.exports = {
  "imperialUnits" : [/quarts?/],
  "standardInputUnit" : " quarts",
  "isInvalidInput" : shared.isZeroOrNegative,
  "isWeaklyInvalidInput" : shared.isHyperbole,
  "conversionFunction" : (i) => volume.toMap(i, (j) => j * 0.946353),
  "ignoredUnits" : volume.metricUnits
}
