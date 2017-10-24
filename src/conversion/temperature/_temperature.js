const shared = require('../shared');

function temperatureMap(imperialInputs, metricTransform) {
  const degreesC = imperialInputs.map(metricTransform);

  if (degreesC > -17.76 && degreesC < 0) {
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
