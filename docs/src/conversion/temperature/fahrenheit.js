const shared = require('../shared_conversion_functions');
const temperature = require('./_temperature');

module.exports = {
  "imperialUnits" : [/(?:°|degrees?) ?(?:f|fahrenheit)/, /fahrenheit/],
  "weakImperialUnits" : ["f", "degrees?"],
  "standardInputUnit" : "°F",
  "isInvalidInput" : (i) => false,
  "isWeaklyInvalidInput" : (i) => i > 1000,
  "conversionFunction" : (i) => temperature.toMap(i, (j) => (j - 32) * 5/9),
  "ignoredUnits" : temperature.metricUnits
}