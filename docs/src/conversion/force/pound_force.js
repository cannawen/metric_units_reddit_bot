const shared = require('../shared_conversion_functions');
const force = require('./_force');

module.exports = {
  "imperialUnits" : [/pounds?[ -]?(?:force)/, /lbf/, /lbs?[ -]?(?:force)/],
  "standardInputUnit" : " lbf",
  "isInvalidInput" : shared.isZeroOrNegative,
  "isWeaklyInvalidInput" : shared.isHyperbole,
  "conversionFunction" : (i) => force.toMap(i, (j) => j * 4.44822),
  "ignoredUnits" : force.metricUnits
}
