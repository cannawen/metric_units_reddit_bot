const shared = require('../shared');

function velocityMap(imperialInputs, metricTransform) {
  const mPerS = imperialInputs.map(metricTransform);

  const unitDecider = Math.max(...mPerS);

  // Under 360 km/h only convert to km/h
  if (unitDecider < 100) { 
    return shared.createMap(mPerS, i => i * 3.6, " km/h");

  // Over 1% of speed of light convert to c
  } else if (unitDecider >= 2997924.58) { 
    return shared.createMap(mPerS, i => i / 299792458, "c");

  // Between 360 km/h and 1% of c, convert to both km/h and a per-second measurement
  } else {

    return [
      shared.createMap(mPerS, i => i * 3.6, " km/h"), 
      unitDecider < 1000 ?
        shared.createMap(mPerS, i => i, " m/s")
        :
        shared.createMap(mPerS, i => i / 1000, " km/s")
    ];
  }
}

const metricVelocityUnits = ["km/hr?", "kmh", "kph", "kilometers? ?(?:per|an|/) ?hour", "m/s"];

module.exports = {
  "toMap" : velocityMap,
  "metricUnits" : metricVelocityUnits
}
