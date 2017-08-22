const rh = require('./regex_helper');

function isHyperboleOrZeroOrNegative(i) {
  return i.toString().match(/^100+(?:\.0+)?$/) || i <= 0;
}

const unitsLookupMap = {
  //Workaround: longest key is processed first so "miles per hour" will not be read as "miles"
  "miles per gallon to L/100km" : {
    "unitRegex" : [/mpg/, /miles per gallon/].regexJoin(),
    "shouldConvert" : (i) => {
      if (isHyperboleOrZeroOrNegative(i)) {
        return false;
      }
      return true;
    },
    "conversionFunction": (i) => 235.215 / i,
    "inUnits" : " mpg (US)",
    "outUnits" : " L/100km",
    "precisionThreshold" : 10
  },

  "miles per hour to km/h": {
    "unitRegex" : [/mph/, /miles per hour/, /miles an hour/].regexJoin(),
    "shouldConvert" : (i) => {
      if (isHyperboleOrZeroOrNegative(i)) {
        return false;
      }
      return true;
    },
    "conversionFunction" : (i) => i * 1.609344,
    "inUnits" : " mph",
    "outUnits" : " km/h",
    "precisionThreshold" : 10
  },

  "feet to metres": {
    "unitRegex" : [/-?feet/, /-?ft/, /-?foot/].regexJoin(),
    "shouldConvert" : (i) => {
      if (isHyperboleOrZeroOrNegative(i)) {
        return false;
      }
      return true;
    },
    "conversionFunction" : (i) => i * 0.3048,
    "inUnits" : (num) => num == 1 ? " foot" : " feet",
    "outUnits" : (num) => num == 1 ? " metre" : " metres",
    "precisionThreshold" : 100,
    "preprocess" : (input) => {
      const feetAndInchesRegex = 
        (
          rh.startRegex 
          + rh.numberRegex
          + [/['][ -]?/, "[ -]?" + unitsLookupMap['feet to metres']['unitRegex'] + "[ -]?"].regexJoin()
          + rh.numberRegex
          + [/["]/, /[ -]?in/, "[ -]?" + unitsLookupMap['in to cm']['unitRegex']].regexJoin()
          + rh.endRegex
        ).regex();
      return input.replace(feetAndInchesRegex, (match, feet, inches, offset, string) => {
        return " " + rh.roundToDecimalPlaces(Number(feet) + Number(inches)/12, 2) + "ft";
      });
    }
  },

  "in to cm": {
    "unitRegex" : [/-in/, /-?inch/, /inches/].regexJoin(),
    "shouldConvert" : (i) => {
      if (isHyperboleOrZeroOrNegative(i)) {
        return false;
      }
      return true;
    },
    "conversionFunction" : (i) => i * 2.54,
    "inUnits": (num) => num == 1 ? " inch" : " inches",
    "outUnits": " cm",
    "precisionThreshold" : 100
  },

  "miles to km": {
    "unitRegex" : [/mi/, /-?miles?/].regexJoin(),
    "shouldConvert" : (i) => {
      if (isHyperboleOrZeroOrNegative(i)) {
        return false;
      } 
      return true;
    },
    "conversionFunction" : (i) => i * 1.609344,
    "inUnits" : (num) => num == 1 ? " mile" : " miles",
    "outUnits" : " km",
    "precisionThreshold" : 10
  },

  "°F to °C" : {
    "unitRegex" : [
                    /° ?f/, 
                    /degrees? f/,
                    /degrees? fahrenheit/,
                    /fahrenheit/
                  ].regexJoin(),
    "conversionFunction" : (i) => (i - 32) * 5/9,
    "inUnits" : "°F",
    "outUnits" : "°C"
  }
}

module.exports = {
  "unitsLookupMap" : unitsLookupMap
}