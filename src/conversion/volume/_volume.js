const shared = require('../shared');

function volumeMap(imperialInputs, transformToLitres) {
  const litres = imperialInputs.map(transformToLitres);

  const unitDecider = Math.max(...litres);

  let transformToUnit = undefined;
  let unit = undefined;

  if (unitDecider < 1) {
    transformToUnit = l => l * 1000;
    unit = " mL";

  } else if (unitDecider > 1000000000000) {
    transformToUnit = l => l / 1000000000000;
    unit = " km^3";

  } else if (unitDecider > 1000) {
    transformToUnit = l => l / 1000;
    unit = " m^3";

  } else {
    transformToUnit = l => l;
    unit = " L";
  }

  return shared.createMap(litres, transformToUnit, unit);
}

const metricVolumeUnits = [/(?:milli|centi|deca|kilo)?lit(?:er|re)s?/, /(?:deca|kilo)?m(?:eters?)?(?:\^3| cubed?)/];

module.exports = {
  "toMap" : volumeMap,
  "metricUnits" : metricVolumeUnits
}
