const shared = require('../shared');
const distance = require('./distance');

module.exports = {
  "imperialUnits" : [/mi/, /miles?/],
  "standardInputUnit" : " miles",
  "isInvalidInput" : shared.isZeroOrNegative,//this will be shared as well
  "isWeaklyInvalidInput" : (i) => shared.isHyperbole(i) || i === 8,
  "conversionFunction" : (i) => distance.toMap(i, (j) => j * 1609.344), //TODO refactor so we use folder to determine that this is distance so we don't need to explicitly state
  "ignoredUnits" : distance.metricUnits,//TODO refactor so we don't need to explicitly state
  "ignoredKeywords" : ["churn", "credit card", "visa", "mastercard", "awardtravel",
                       "air miles", "aeroplan", "points",
                       "italy", "italian", "croatia", "brasil", "brazil", "turkey", "mexico"].concat(shared.ukSubreddits) //TODO refactor so array can take arrays inside so we don't need to concat
}
