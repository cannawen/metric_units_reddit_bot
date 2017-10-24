const shared = require('../shared');

function distanceMap(imperialInputs, transformToMetres) {
  const metres = imperialInputs.map((i) => transformToMetres(i));
  
  const unitDecider = Math.max(...metres);

  let metresToUnitTransform = undefined;
  let unit = undefined;

  if (unitDecider < 0.01) {
    metresToUnitTransform = m => m * 1000;
    unit = " mm";

  } else if (unitDecider < 1) {
    metresToUnitTransform = m => m * 100;
    unit = " cm";

  } else if (unitDecider > 94607304725808) {
    metresToUnitTransform = m => m / 9460730472580800;
    unit = " light-years";

  } else if (unitDecider >= 3218688000) {
    metresToUnitTransform = m => m / 299792458;
    unit = " light-seconds";

  } else if (unitDecider >= 1000) {
    metresToUnitTransform = m => m / 1000;
    unit = " km";

  } else {
    metresToUnitTransform = m => m;
    unit = " metres";
  }

  return shared.createMap(metres, metresToUnitTransform, unit);
}

const metricDistanceUnits = [/km/, /light-?years?/,
                             /(?:milli|centi|deca|kilo)?met(?:re|er)s?/];

module.exports = {
  "toMap" : distanceMap,
  "metricUnits" : metricDistanceUnits
}
