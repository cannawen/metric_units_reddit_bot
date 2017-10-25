const shared = require('../shared_conversion_functions');

function areaMap(imperialInputs, metricTransform) {
  const metresSquared = imperialInputs.map(metricTransform);

  const unitDecider = Math.max(...metresSquared);

  let unitTransform = undefined;
  let unit = undefined;

  if (unitDecider >= 1000000) {
    unitTransform = i => i / 1000000;
    unit = " km^2";

  } else if (unitDecider >= 10000) {
    unitTransform = i => i / 10000;
    unit = " hectares";

  } else {
    unitTransform = i => i;
    unit = " m^2";
  }

  return shared.createMap(metresSquared, unitTransform, unit);
}

const metricAreaUnits = [
      /square kilometers?/,
      /sq\.? km/,
      /sq\.? kilometers?/,
      /km[^]2/,
      /hectares/,
      /m^2/
    ];

module.exports = {
  "toMap" : areaMap,
  "metricUnits" : metricAreaUnits
}
