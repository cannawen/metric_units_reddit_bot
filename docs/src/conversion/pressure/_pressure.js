const shared = require('../shared_conversion_functions');

function pressureMap(imperialInputs, metricTransform) {
  const pascals = imperialInputs.map(metricTransform);

  const unitDecider = Math.max(...pascals);

  let unitTransform = undefined;
  let unit = undefined;

  if (unitDecider < 1000) {
    unitTransform = pa => pa;
    unit = " Pa";

  } else {
    unitTransform = pa => pa / 1000;
    unit = " kPa";

  }
  
  return shared.createMap(pascals, unit, unitTransform);
}

const metricPressureUnits = [/pascals?/];

module.exports = {
  "toMap" : pressureMap,
  "metricUnits" : metricPressureUnits
}
