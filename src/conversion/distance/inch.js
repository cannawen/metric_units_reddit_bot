const shared = require('../shared');
const distance = require('./_distance');

module.exports = {
  "imperialUnits" : [/inch/, /inches/],
  "weakImperialUnits" : [/["]/, /''/, /in/],
  "standardInputUnit" : " inches",
  "isInvalidInput" : shared.isZeroOrNegative,
  "isWeaklyInvalidInput" : shared.isHyperbole,
  "conversionFunction" : (i) => distance.toMap(i, (j) => j * 0.0254),
  "ignoredUnits" : distance.metricUnits,
  "ignoredKeywords" : ["monitor", "monitors", "screen", "tv", "tvs",
                      "ipad", "iphone", "phone", "tablet", "tablets",
                      "apple", "windows", "linux", "android", "ios",
                      "macbook", "laptop", "laptops", "computer", "computers", "notebook", "imac", "pc", "dell", "thinkpad", "lenovo",
                      "rgb", "hz"]
}
