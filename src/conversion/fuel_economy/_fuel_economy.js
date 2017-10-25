const shared = require('../shared_conversion_functions');

function fuelEconomyMap(imperialInputs, metricTransform) {
  const kmL = imperialInputs.map(metricTransform);

  return [
    shared.createMap(kmL, kmL => kmL, " km/L"),
    shared.createMap(kmL, kmL => 100 / kmL, " L/100km")
  ];
}

const metricUnits = ["L/100km", "km/L"];

module.exports = {
  "toMap" : fuelEconomyMap,
  "metricUnits" : metricUnits
}
