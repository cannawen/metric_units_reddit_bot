const shared = require('../shared');

function weightMap(imperialInputs, transformToGrams) {
  const grams = imperialInputs.map(transformToGrams);

  const unitDecider = Math.max(...grams);

  let gramToUnitTransform = undefined;
  let unit = undefined;

  if (unitDecider < 1000) {
    gramToUnitTransform = g => g;
    unit = " g";

  } else if (unitDecider < 1000000) {
    gramToUnitTransform = g => g / 1000;
    unit = " kg";

  } else {
    gramToUnitTransform = g => g / 1000000;
    unit = " metric tons";
  }

  return shared.createMap(grams, gramToUnitTransform, unit);
}

const metricWeightUnits = [/kgs?/, /grams?/, /kilograms?/];

module.exports = {
  "toMap" : weightMap,
  "metricUnits" : metricWeightUnits
}
