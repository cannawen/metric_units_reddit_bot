const shared = require('../shared');
const distance = require('./_distance');

module.exports = {
  "imperialUnits" : [/mi/, /miles?/],
  "standardInputUnit" : " miles",
  "isInvalidInput" : shared.isZeroOrNegative,
  "isWeaklyInvalidInput" : (i) => shared.isHyperbole(i) || i === 8,
  "conversionFunction" : (i) => distance.toMap(i, (j) => j * 1609.344),
  "ignoredUnits" : distance.metricUnits,
  "ignoredKeywords" : ["churn", "credit card", "visa", "mastercard", "awardtravel",
                       "air miles", "aeroplan", "points",
                       "italy", "italian", "croatia", "brasil", "brazil", "turkey", "mexico"].concat(shared.ukSubreddits)
}
