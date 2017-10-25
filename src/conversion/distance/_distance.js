const shared = require('../shared_conversion_functions');

function distanceMap(imperialInputs, metricTransform) {
  const metres = imperialInputs.map(metricTransform);
  
  const unitDecider = Math.max(...metres);

  let unitTransform = undefined;
  let unit = undefined;

  if (unitDecider < 0.01) {
    unitTransform = m => m * 1000;
    unit = " mm";

  } else if (unitDecider < 1) {
    unitTransform = m => m * 100;
    unit = " cm";

  } else if (unitDecider > 94607304725808) {
    unitTransform = m => m / 9460730472580800;
    unit = " light-years";

  } else if (unitDecider >= 3218688000) {
    unitTransform = m => m / 299792458;
    unit = " light-seconds";

  } else if (unitDecider >= 1000) {
    unitTransform = m => m / 1000;
    unit = " km";

  } else {
    unitTransform = m => m;
    unit = " metres";
  }

  return shared.createMap(metres, unitTransform, unit);
}

const metricDistanceUnits = [/km/, /light-?years?/,
                             /(?:milli|centi|deca|kilo)?met(?:re|er)s?/];

module.exports = {
  "toMap" : distanceMap,
  "metricUnits" : metricDistanceUnits
}
