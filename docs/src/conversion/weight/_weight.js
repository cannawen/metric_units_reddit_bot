const shared = require('../shared_conversion_functions');

function weightMap(imperialInputs, metricTransform) {
  const grams = imperialInputs.map(metricTransform);

  const unitDecider = Math.max(...grams);

  let unitTransform = undefined;
  let unit = undefined;

  if (unitDecider < 1000) {
    unitTransform = g => g;
    unit = " g";

  } else if (unitDecider < 1000000) {
    unitTransform = g => g / 1000;
    unit = " kg";

  } else {
    unitTransform = g => g / 1000000;
    unit = " metric tons";
  }

  return shared.createMap(grams, unit, unitTransform);
}

const metricWeightUnits = [/kgs?/, /grams?/, /kilograms?/];

module.exports = {
  "toMap" : weightMap,
  "metricUnits" : metricWeightUnits
}
