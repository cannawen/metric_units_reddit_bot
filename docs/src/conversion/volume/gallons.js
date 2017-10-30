const shared = require('../shared_conversion_functions');
const volume = require('./_volume');

module.exports = {
  "imperialUnits" : [/gal(?:lons?)?/],
  "standardInputUnit" : " gal (US)",
  "isInvalidInput" : shared.isZeroOrNegative,
  "isWeaklyInvalidInput" : shared.isHyperbole,
  "conversionFunction" : (i) => volume.toMap(i, (j) => j * 3.78541),
  "ignoredUnits" : ["imperial"].concat(volume.metricUnits),
  "ignoredKeywords" : shared.ukSubreddits
}
