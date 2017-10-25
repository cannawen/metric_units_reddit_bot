const shared = require('../shared_conversion_functions');

function torqueMap(imperialInputs, metricTransform) {
  const Nm = imperialInputs.map(metricTransform);

  return shared.createMap(Nm, Nm => Nm, " N⋅m");
}

const metricTorqueUnits = [/newton[ -⋅]?met(?:er|re)s?/, /N⋅?m/];

module.exports = {
  "toMap" : torqueMap,
  "metricUnits" : metricTorqueUnits
}
