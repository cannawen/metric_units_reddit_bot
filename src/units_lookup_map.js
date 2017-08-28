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

function roundToDecimalPlaces(number, places) {
  const multiplier = Math.pow(10, places);
  return (Math.round(number * multiplier)/multiplier).toFixed(places);
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

  return rh.addCommas(roundToDecimalPlaces(value, decimals));
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
  return Math.floor(i).toString() + "'" + roundToDecimalPlaces(i%1 * 12, 0) + "\"";
}

const unitsLookupMap = {
  //Workaround: longest key is processed first so "miles per hour" will not be read as "miles"
  "miles per gallon to L/100km" : {
    "unitRegex" : rh.regexJoinToString([/mpg/, /miles per gal(?:lon)?/]),
    "shouldConvert" : (i) => isNotHyperbole(i) && i >= 10 && i < 235,
    "inDisplay" : (i) => userFacingValueAndUnit(i, " mpg (US)"),
    "inDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " mpg (US)"),
    "outDisplay" : (i) => userFacingValueAndUnit(i, " L/100km", mpgToLper100km, 10),
    "outDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " L/100km", mpgToLper100km, 10),
    "ignoredKeywords" : ["basketball", "hockey", "soccer", "football", "rugby", "lacrosse", "cricket", "volleyball", "polo",
                         "nba", "nhl", "nfl", "sport",
                         "play", "game",
                         "britain", "british", "england", "scotland", "wales", "uk"]
  },

  "miles per hour to km/h": {
    "unitRegex" : rh.regexJoinToString([/mph/, /miles (?:an|per) hour/]),
    "shouldConvert" : (i) => isNotHyperbole(i) && i > 0 && [1, 10, 60].indexOf(i) === -1,
    "inDisplay" : (i) => userFacingValueAndUnit(i, " mph"),
    "inDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " mph"),
    "outDisplay" : (i) => userFacingValueAndUnit(i, " km/h", milesToKm, 10),
    "outDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " km/h", milesToKm, 10),
    "ignoredKeywords" : ["britain", "british", "england", "scotland", "wales", "uk"]
  },

  "feet to metres": {
    "unitRegex" : rh.regexJoinToString([/-?feet/, /-ft/, /-?foot/]),
    "weakUnitsRegex" : rh.regexJoinToString([/[']/, /ft/]),
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
        new RegExp(( rh.startRegex 
          + rh.numberRegex
          + rh.regexJoinToString(["[\']", " ?ft", " ?" + unitsLookupMap['feet to metres']['unitRegex']])
          + "[- ]?"
          + rh.numberRegex
          + rh.regexJoinToString([rh.endRegex, /["]/, / ?in/, " ?" + unitsLookupMap['in to cm']['unitRegex']])
        ),'gi');
      return input.replace(feetAndInchesRegex, (match, feet, inches, offset, string) => {
        const inchesLessThan12 = inches <= 12;
        const inchesLessThan3CharactersBeforeDecimal = inches
            .toString()
            .split('.')[0]
            .replace(/[^\d\.]/,'')
            .length <= 2
        if (inchesLessThan12 && inchesLessThan3CharactersBeforeDecimal) {
          return " " + roundToDecimalPlaces(Number(feet) + Number(inches)/12, 2) + " feet ";
        } else {
          return "  ";
        }
      });
    }
  },

  "in to cm" : {
    "unitRegex" : rh.regexJoinToString([/-in/, /-?inch/, /inches/]),
    "weakUnitsRegex" : rh.regexJoinToString([/["]/, /in/]),
    "shouldConvert" : (i) => isNotHyperbole(i) && i > 0 && i != 1,
    "inDisplay" : (i) => userFacingValueAndUnit(i, " inches"),
    "inDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " inches"),
    "outDisplay" : (i) => userFacingValueAndUnit(i, " cm", inchesToCm, 100),
    "outDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " cm", inchesToCm, 100),
    "ignoredKeywords" : ["monitor", "screen", "tv", 
                        "ipad", "iphone", "phone", "tablet", 
                        "apple", "windows", "linux", "android", "ios",
                        "macbook", "laptop", "computer", "notebook", "imac", "pc", "dell", "thinkpad",
                        "rgb", "hz",]
  },

  "lb to kg" : {
    "unitRegex" : "-?lbs?",
    "weakUnitsRegex" : rh.regexJoinToString([/-?pound/, /pounds/]),
    "shouldConvert" : (i) => isNotHyperbole(i) && i > 0,
    "inDisplay" : (i) => userFacingValueAndUnit(i, " lb"),
    "inDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " lb"),
    "outDisplay" : (i) => userFacingValueAndUnit(i, " kg", lbToKg, [50, 10]),
    "outDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " kg", lbToKg, [50, 10]),
  },

  "miles to km" : {
    "unitRegex" : rh.regexJoinToString([/mi/, /-?miles?/]),
    "shouldConvert" : (i) => isNotHyperbole(i) && i > 0 && [1, 8, 10].indexOf(i) === -1,
    "inDisplay" : (i) => userFacingValueAndUnit(i, " miles"),
    "inDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " miles"),
    "outDisplay" : (i) => userFacingValueAndUnit(i, " km", milesToKm, 10),
    "outDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " km", milesToKm, 10),
    "ignoredKeywords" : ["churn", "credit card", "visa", "mastercard", "awardtravel",
                         "air miles", "aeroplan", "points",
                         "britain", "british", "england", "scotland", "wales", "uk",
                         "italy", "italian", "croatia"]
  },

  "°F to °C" : {
    "unitRegex" : rh.regexJoinToString([
                    /(?:°|degrees?) ?(?:f|fahrenheit)/,
                    /fahrenheit/
                  ]),
    "weakUnitsRegex" : "f",
    "inDisplay" : (i) => userFacingValueAndUnit(i, "°F"),
    "inDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, "°F"),
    "outDisplay" : (i) => userFacingValueAndUnit(i, "°C", fahrenheitToCelsius),
    "outDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, "°C", fahrenheitToCelsius)
  }
};

const globalIgnore = [/(?:\n|^)(?:>|&gt;) /,

                      "kill", "suicide", "death", "die", "depression", "crisis", "emergency", "therapy", "therapist", "murder", "rip", "rest in peace", "fatal",

                      "america", "usa", "united states",

                      "dick", "penis", "dong", "cock", "member", "phallus", "wood", "willy", "pecker", "manhood", "boner", "junk", "wiener", "shaft", "dildo",
                      "genitalia", "clit", "labia", "pussy", "vagina", "snatch",
                      "ass", "anus", "anal", "butt", 'tit', 'kink', 'bdsm',
                      "nsfw", "gonewild", "sex", "glory hole", "cuck", "porn", "incest"]
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
