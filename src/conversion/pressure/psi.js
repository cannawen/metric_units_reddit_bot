const shared = require('../shared');
const pressure = require('./_pressure');

module.exports = {
  "imperialUnits" : [/psi/, /pounds?[ -]?(?:force)?[- ]?(?:per|an?[/])[- ]?squared? inch/],
  "standardInputUnit" : " psi",
  "isInvalidInput" : shared.isZeroOrNegative,
  "isWeaklyInvalidInput" : shared.isHyperbole,
  "conversionFunction" : (i) => pressure.toMap(i, (j) => j * 6894.76),
  "ignoredUnits" : pressure.metricUnits,
  "ignoredKeywords" : ["homebrewing"]
}
