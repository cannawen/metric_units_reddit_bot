const shared = require('../shared');
const volume = require('./_volume');

module.exports = {
  "imperialUnits" : [/pecks?/],
  "standardInputUnit" : " pecks (US)",
  "isInvalidInput" : shared.isZeroOrNegative,
  "isWeaklyInvalidInput" : shared.isHyperbole,
  "conversionFunction" : (i) => volume.toMap(i, (j) => j * 8.80977),
  "ignoredUnits" : ["imperial"].concat(volume.metricUnits),
  "ignoredKeywords" : shared.ukSubreddits
}
