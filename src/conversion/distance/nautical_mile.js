const shared = require('../shared_conversion_functions');
const distance = require('./_distance');

module.exports = {
  "imperialUnits" : [/nmi/, /nautical\smiles?/],
  "standardInputUnit" : " nmi",
  "isInvalidInput" : shared.isZeroOrNegative,
  "isWeaklyInvalidInput": shared.isHyperbole,
  "conversionFunction" : (i) => distance.toMap(i, (j) => j * 1852),
  "ignoredUnits" : distance.metricUnits
}
