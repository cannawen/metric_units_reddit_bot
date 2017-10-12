const shared = require("../shared.js")

module.exports = {
  "imperialUnits" : [/mph/, /miles (?:an|per) hour/],
  "standardInputUnit" : " mph",
  "isInvalidInput" : shared.isZeroOrNegative,
  "isWeaklyInvalidInput" : (i) => shared.isHyperbole(i) || [60, 88].indexOf(i) !== -1,
  "conversionFunction" : (i) => shared.velocityMap(i.map((j) => j * 0.44704)), // 1 mph = 0.44704 m/s
  "ignoredUnits" : ["km/hr?", "kmh", "kph", "kilometers? ?(?:per|an|/) ?hour", "m/s"],
  "ignoredKeywords" : shared.ukSubreddits
}