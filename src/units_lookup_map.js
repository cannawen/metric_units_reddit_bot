const rh = require('./regex_helper');

function mpgToLper100km(i) {
  return 235.215 / i;
}

function milesToKm(i) {
  return i * 1.609344;
}

function feetToMetres(i) {
  return i * 0.3048;
}

function inchesToCm(i) {
  return i * 2.54;
}

function lbToKg(i) {
  return i * 0.453592;
}

function fahrenheitToCelsius(i) {
  return (i - 32) * 5/9;
}

//-----------------------------------

function isNotHyperbole(i) {
  return i.toString().match(/^100+(?:\.0+)?$/) === null;
}

function userFacingValue(input, conversionFunction, precisionThreshold) {
  input = input.toString();

  const value = conversionFunction ? conversionFunction(input) : input;
  let decimals = 0;

  if (input.indexOf('.') !== -1) {
    decimals = input.split(".")[1].length;
  } else {
    if (Array.isArray(precisionThreshold)) {
      for (let i = 0; i < precisionThreshold.length; i++) {
        if (value < precisionThreshold[i]) {
          decimals = i + 1;
        } else {
          break;
        }
      }
    } else if (precisionThreshold !== undefined && value < precisionThreshold) {
      decimals = 1;
    }
  }

  return rh.roundToDecimalPlaces(value, decimals).addCommas();
}

function userFacingValueAndUnit(i, unit, conversionFunction, precision) {
  return userFacingValue(i, conversionFunction, precision) + unit;
}

function userFacingValueAndUnitRange(i, j, unit, conversionFunction, precision) {
  const iConverted = userFacingValue(i, conversionFunction, precision);
  const jConverted = userFacingValue(j, conversionFunction, precision);
  if (iConverted === jConverted) {
    return iConverted + unit
  } else {
    return iConverted
    + " to "
    + jConverted
    + unit;
  }
}

function convertDecimalFeetToFeetAndInches(i) {
  return Math.floor(i).toString() + "'" + rh.roundToDecimalPlaces(i%1 * 12, 0) + "\"";
}

const unitsLookupMap = {
  //Workaround: longest key is processed first so "miles per hour" will not be read as "miles"
  "miles per gallon to L/100km" : {
    "unitRegex" : [/mpg/, /miles per gallon/].regexJoin(),
    "shouldConvert" : (i) => isNotHyperbole(i) && i >= 10 && i < 235,
    "inDisplay" : (i) => userFacingValueAndUnit(i, " mpg (US)"),
    "inDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " mpg (US)"),
    "outDisplay" : (i) => userFacingValueAndUnit(i, " L/100km", mpgToLper100km, 10),
    "outDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " L/100km", mpgToLper100km, 10),
    "ignoredKeywords" : ["basketball", "hockey", "soccer", "football", "rugby", "lacrosse", "cricket", "volleyball", "polo",
                         "nba", "nhl", "nfl", "sport"]
  },

  "miles per hour to km/h": {
    "unitRegex" : [/mph/, /miles per hour/, /miles an hour/].regexJoin(),
    "shouldConvert" : (i) => isNotHyperbole(i) && i > 0 && i != 1 && i != 10,
    "inDisplay" : (i) => userFacingValueAndUnit(i, " mph"),
    "inDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " mph"),
    "outDisplay" : (i) => userFacingValueAndUnit(i, " km/h", milesToKm, 10),
    "outDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " km/h", milesToKm, 10)
  },

  "feet to metres": {
    "unitRegex" : [/-?feet/, /-ft/, /-?foot/].regexJoin(),
    "shouldConvert" : (i) => isNotHyperbole(i) && i > 0 && [1, 2, 4, 6].indexOf(i) === -1,
    "inDisplay" : (i) => {
      if (i%1 == 0) {
        return userFacingValueAndUnit(i.split('.')[0], " ft");
      } else {
        return convertDecimalFeetToFeetAndInches(i);
      }
    },
    "inDisplayRange" : (i, j) => {
      if (i%1 == 0 && j%1 == 0) {
        return userFacingValueAndUnitRange(i.split('.')[0], j.split('.')[0], " ft");
      } else {
        return convertDecimalFeetToFeetAndInches(i) + " to " + convertDecimalFeetToFeetAndInches(j);
      }
    },
    "outDisplay" : (i) => userFacingValueAndUnit(i, " metres", feetToMetres, 100),
    "outDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " metres", feetToMetres, 100),
    "preprocess" : (input) => {
      const feetAndInchesRegex = 
        ( rh.startRegex 
          + rh.numberRegex
          + ["[\']", " ?ft", " ?" + unitsLookupMap['feet to metres']['unitRegex']].regexJoin()
          + "[- ]?"
          + rh.numberRegex
          + [rh.endRegex, /["]/, / ?in/, " ?" + unitsLookupMap['in to cm']['unitRegex']].regexJoin()
        ).regex();
      return input.replace(feetAndInchesRegex, (match, feet, inches, offset, string) => {
        const inchesLessThan12 = inches <= 12;
        const inchesLessThan3CharactersBeforeDecimal = inches
            .toString()
            .split('.')[0]
            .replace(/[^\d\.]/,'')
            .length <= 2
        if (inchesLessThan12 && inchesLessThan3CharactersBeforeDecimal) {
          return " " + rh.roundToDecimalPlaces(Number(feet) + Number(inches)/12, 2) + " feet ";
        } else {
          return "  ";
        }
      });
    }
  },

  "in to cm" : {
    "unitRegex" : [/-in/, /-?inch/, /inches/].regexJoin(),
    "shouldConvert" : (i) => isNotHyperbole(i) && i > 0 && i != 1,
    "inDisplay" : (i) => userFacingValueAndUnit(i, " inches"),
    "inDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " inches"),
    "outDisplay" : (i) => userFacingValueAndUnit(i, " cm", inchesToCm, 100),
    "outDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " cm", inchesToCm, 100),
    "ignoredKeywords" : ["monitor", "screen", "tv", 
                        "ipad", "iphone", "phone", "tablet", 
                        "apple", "windows", "linux", "android", "ios",
                        "macbook", "laptop", "computer", "notebook", "imac", "pc", "dell",
                        "rgb", "hz",]
  },

  "lb to kg" : {
    "unitRegex" : [/-?lb/, /-?pound/, /pounds/].regexJoin(),
    "shouldConvert" : (i) => isNotHyperbole(i) && i > 0,
    "inDisplay" : (i) => userFacingValueAndUnit(i, " lb"),
    "inDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " lb"),
    "outDisplay" : (i) => userFacingValueAndUnit(i, " kg", lbToKg, [50, 10]),
    "outDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " kg", lbToKg, [50, 10]),
    "ignoredKeywords" : ["uk", "britain", "british", "england", "£", "united kingdom"]
  },

  "miles to km" : {
    "unitRegex" : [/mi/, /-?miles?/].regexJoin(),
    "shouldConvert" : (i) => isNotHyperbole(i) && i > 0 && [1, 8, 10].indexOf(i) === -1,
    "inDisplay" : (i) => userFacingValueAndUnit(i, " miles"),
    "inDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " miles"),
    "outDisplay" : (i) => userFacingValueAndUnit(i, " km", milesToKm, 10),
    "outDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " km", milesToKm, 10),
    "ignoredKeywords" : ["churn", "credit card", "visa", "mastercard", "awardtravel",
                         "air miles", "aeroplan", "points",
                         "america", "usa", "uk", "italy", "croatia"]
  },

  "°F to °C" : {
    "unitRegex" : [
                    /° ?f/, 
                    /degrees? f/,
                    /degrees? fahrenheit/,
                    /fahrenheit/
                  ].regexJoin(),
    "inDisplay" : (i) => userFacingValueAndUnit(i, "°F"),
    "inDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, "°F"),
    "outDisplay" : (i) => userFacingValueAndUnit(i, "°C", fahrenheitToCelsius),
    "outDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, "°C", fahrenheitToCelsius)
  }
};

const globalIgnore = [/\n> /, /^> /,
                      "dick", "penis", "dong", "cock", "member", "phallus", "wood", "willy", "pecker", "manhood", "boner", "junk", "wiener", "shaft",
                      "genitalia", "clit", "labia", "pussy", "vagina", "snatch",
                      "ass", "anus", "anal", "butt", 
                      "nsfw", "gonewild", "sex", "glory hole"]
module.exports = {
  "unitsLookupMap" : Object.keys(unitsLookupMap)
                           .reduce((memo, key) => {
                              const map = unitsLookupMap[key];
                              if (map['ignoredKeywords']) {
                                map['ignoredKeywords'] = map['ignoredKeywords'].concat(globalIgnore);
                              } else {
                                map['ignoredKeywords'] = globalIgnore;
                              }
                              memo[key] = map;
                              return memo;
                           }, {})
}
