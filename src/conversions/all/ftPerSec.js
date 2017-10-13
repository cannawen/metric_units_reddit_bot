const shared = require("../shared.js")

module.exports = {
    "imperialUnits" : [/f(?:oo|ee)?t (?:\/|per) s(?:ec(?:ond)?)?/],
    "standardInputUnit" : " ft/sec",
    "isInvalidInput" : shared.isZeroOrNegative,
    "isWeaklyInvalidInput" : shared.isHyperbole,
    "conversionFunction" : (i) => shared.velocityMap(i.map((j) => j * 0.3048)) // 1 ft/s = 0.3048 m/s
  }