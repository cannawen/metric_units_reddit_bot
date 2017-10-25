const shared = require('../shared_conversion_functions');

function temperatureMap(imperialInputs, metricTransform) {
  const degreesC = imperialInputs.map(metricTransform);

  const unitDeciderF = Math.max(...imperialInputs);

  if (unitDeciderF > 0 && unitDeciderF < 32) {
    return [
      shared.createMap(degreesC, c => c, "°C"),
      shared.createMap(imperialInputs, f => f * 5/9, " change in °C")
    ];
  } else {
    return shared.createMap(degreesC, c => c, "°C");  
  }
}

const metricForceUnits = [/° ?C/, "degrees? c", "celsius", "kelvin"];

module.exports = {
  "toMap" : temperatureMap,
  "metricUnits" : metricForceUnits
}
