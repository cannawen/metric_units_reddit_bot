const shared = require('../shared');
const distance = require('./distance');

module.exports = {
  "imperialUnits" : [/nmi/, /nautical\smiles?/],
  "standardInputUnit" : " nmi",
  "isInvalidInput" : shared.isZeroOrNegative,
  "isWeaklyInvalidInput": shared.isHyperbole,
  "conversionFunction" : (i) => distance.toMap(i, (j) => j * 1852),
  "ignoredUnits" : distance.metricUnits
}
