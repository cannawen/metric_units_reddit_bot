const shared = require('../shared_conversion_functions');
const volume = require('./_volume');

module.exports =   {
  "imperialUnits" : [/\(?(?:uk|imp(?:erial)?)\)? gal(?:lons?)?/, 
                     /gal(?:lons?)? \(?(?:uk|imp(?:erial)?\)?)/],
  "standardInputUnit" : " gal (imp)",
  "isInvalidInput" : shared.isZeroOrNegative,
  "isWeaklyInvalidInput" : shared.isHyperbole,
  "conversionFunction" : (i) => volume.toMap(i, (j) => j * 4.54609),
  "ignoredUnits" : volume.metricUnits
}