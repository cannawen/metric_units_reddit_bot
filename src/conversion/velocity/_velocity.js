const shared = require('../shared_conversion_functions');

function velocityMap(imperialInputs, metricTransform) {
  const mPerS = imperialInputs.map(metricTransform);

  const unitDecider = Math.max(...mPerS);

  // Under 360 km/h only convert to km/h
  if (unitDecider < 100) { 
    return shared.createMap(mPerS, " km/h", i => i * 3.6);

  // Over 1% of speed of light convert to c
  } else if (unitDecider >= 2997924.58) { 
    return shared.createMap(mPerS, "c", i => i / 299792458);

  // Between 360 km/h and 1% of c, convert to both km/h and a per-second measurement
  } else {

    return [
      shared.createMap(mPerS, " km/h", i => i * 3.6), 
      unitDecider < 1000 ?
        shared.createMap(mPerS, " m/s")
        :
        shared.createMap(mPerS, " km/s", i => i / 1000)
    ];
  }
}

const metricVelocityUnits = ["km/hr?", "kmh", "kph", "kilometers? ?(?:per|an|/) ?hour", "m/s"];

module.exports = {
  "toMap" : velocityMap,
  "metricUnits" : metricVelocityUnits
}
