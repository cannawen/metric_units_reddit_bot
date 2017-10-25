const shared = require('../shared_conversion_functions');

function volumeMap(imperialInputs, metricTransform) {
  const litres = imperialInputs.map(metricTransform);

  const unitDecider = Math.max(...litres);

  let unitTransform = undefined;
  let unit = undefined;

  if (unitDecider < 1) {
    unitTransform = l => l * 1000;
    unit = " mL";

  } else if (unitDecider > 1000000000000) {
    unitTransform = l => l / 1000000000000;
    unit = " km^3";

  } else if (unitDecider > 1000) {
    unitTransform = l => l / 1000;
    unit = " m^3";

  } else {
    unitTransform = l => l;
    unit = " L";
  }

  return shared.createMap(litres, unitTransform, unit);
}

const metricVolumeUnits = [/(?:milli|centi|deca|kilo)?lit(?:er|re)s?/, /(?:deca|kilo)?m(?:eters?)?(?:\^3| cubed?)/];

module.exports = {
  "toMap" : volumeMap,
  "metricUnits" : metricVolumeUnits
}
