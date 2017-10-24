const shared = require('../shared');
const volume = require('./_volume');

module.exports =  {
  "imperialUnits" : [/tablespoons?/, /tbsp/, /tbl/],
  "standardInputUnit" : " Tbsp",
  "isInvalidInput" : shared.isZeroOrNegative,
  "isWeaklyInvalidInput" : shared.isHyperbole,
  "conversionFunction" : (i) => volume.toMap(i, (j) => j * 0.0147868),
  "ignoredUnits" : volume.metricUnits
}