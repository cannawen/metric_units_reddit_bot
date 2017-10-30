const shared = require('../shared_conversion_functions');

function forceMap(imperialInputs, metricTransform) {
  const newtons = imperialInputs.map(metricTransform);

  return shared.createMap(newtons, " N");
}

const metricForceUnits = [/newtons?/, /dynes?/];

module.exports = {
  "toMap" : forceMap,
  "metricUnits" : metricForceUnits
}
