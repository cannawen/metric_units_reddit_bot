const shared = require('../shared_conversion_functions');

function fuelEconomyMap(imperialInputs, metricTransform) {
  const kmL = imperialInputs.map(metricTransform);

  return [
    shared.createMap(kmL, " km/L"),
    shared.createMap(kmL, " L/100km", kmL => 100 / kmL)
  ];
}

const metricUnits = ["L/100km", "km/L"];

module.exports = {
  "toMap" : fuelEconomyMap,
  "metricUnits" : metricUnits
}
