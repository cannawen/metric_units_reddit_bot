const shared = require('../shared');
const volume = require('./_volume');

module.exports = {
  "imperialUnits" : [/cups?/],
  "standardInputUnit" : " cups (US)",
  "isInvalidInput" : shared.isZeroOrNegative,
  "isWeaklyInvalidInput" : (i) => shared.isHyperbole(i) || i > 100,
  "conversionFunction" : (i) => volume.toMap(i, (j) => j * 0.236588),
  "ignoredUnits" : volume.metricUnits,
  "ignoredKeywords" : ["bra", "band", "sizes?", "clio", "clashofclans", "coc", "clashroyale"]
}
