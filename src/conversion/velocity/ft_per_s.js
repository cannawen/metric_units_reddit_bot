const shared = require('../shared_conversion_functions');
const velocity = require('./_velocity');

module.exports = {
  "imperialUnits" : [/f(?:oo|ee)?t (?:\/|per) s(?:ec(?:ond)?)?/],
  "standardInputUnit" : " ft/sec",
  "isInvalidInput" : shared.isZeroOrNegative,
  "isWeaklyInvalidInput" : shared.isHyperbole,
  "conversionFunction" : (i) => velocity.toMap(i, (j) => j * 0.3048),
  "ignoredUnits" : velocity.metricUnits
}
