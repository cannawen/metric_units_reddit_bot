const shared = require('../shared_conversion_functions');
const torque = require('./_torque');

module.exports = {
  "imperialUnits" : [/(?:pounds?|lbs?)[ -⋅]?(?:inch|in)/],
  "standardInputUnit" : " lb⋅in",
  "isInvalidInput" : shared.isZeroOrNegative,
  "isWeaklyInvalidInput" : shared.isHyperbole,
  "conversionFunction" : (i) => torque.toMap(i, (j) => j * 175.126835),
  "ignoredUnits" : torque.ignoredUnits
}