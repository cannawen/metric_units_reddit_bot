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

function fillZeros(length) {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += '0';
  }
  return out;
}

//Problems rounding negative numbers
function round(input, allowableErrorPercent) {
  let multiplier;

  if (input.toString().split('.').length > 1) {
    multiplier = Math.pow(10, input.toString().split('.')[1].length)
  } else {
    multiplier = 1;
  }

  const nonDecimalInput = input * multiplier;

  const digits = nonDecimalInput.toString().length;

  let output;
  let unroundedDigits = 1;
  do {
    const roundingMultipler = Math.pow(10, digits-unroundedDigits)
    output = Math.round(nonDecimalInput/roundingMultipler) * roundingMultipler;
    unroundedDigits++;
  } while(Math.abs(output - nonDecimalInput)/nonDecimalInput * 100 > allowableErrorPercent);

  return output/multiplier;
}

function currRound(percent) {
  return (input) => round(input, percent);
}

function userFacingValue(input, conversionFunction, roundingFunction) {
  input = input.toString();

  let value;

  if (conversionFunction) {
    value = roundingFunction(conversionFunction(input));
  } else {
    value = input;
  }

  return rh.addCommas(value);
}

function userFacingValueAndUnit(i, unit, conversionFunction, roundingFunction) {
  return userFacingValue(i, conversionFunction, roundingFunction) + unit;
}

function userFacingValueAndUnitRange(i, j, unit, conversionFunction, roundingFunction) {
  const iConverted = userFacingValue(i, conversionFunction, roundingFunction);
  const jConverted = userFacingValue(j, conversionFunction, roundingFunction);
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
    "outDisplay" : (i) => userFacingValueAndUnit(i, " L/100km", mpgToLper100km, currRound(5)),
    "outDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " L/100km", mpgToLper100km, currRound(5)),
    "ignoredKeywords" : ["basketball", "hockey", "soccer", "football", "rugby", "lacrosse", "cricket", "volleyball", "polo",
                         "nba", "nhl", "nfl", "sport",
                         "play", "game",
                         "britain", "british", "england", "scotland", "wales", "uk"]
  },

  "miles per hour to km/h": {
    "unitRegex" : rh.regexJoinToString([/mph/, /miles (?:an|per) hour/]),
    "shouldConvert" : (i) => isNotHyperbole(i) && i > 0 && [1, 10, 60, 88].indexOf(i) === -1,
    "inDisplay" : (i) => userFacingValueAndUnit(i, " mph"),
    "inDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " mph"),
    "outDisplay" : (i) => userFacingValueAndUnit(i, " km/h", milesToKm, currRound(5)),
    "outDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " km/h", milesToKm, currRound(5)),
    "ignoredKeywords" : ["britain", "british", "england", "scotland", "wales", "uk"]
  },

  "feet to metres": {
    "unitRegex" : rh.regexJoinToString([/-?feet/, /-ft/, /-?foot/]),
    "weakUnitsRegex" : rh.regexJoinToString([/[']/, /ft/]),
    "shouldConvert" : (i) => isNotHyperbole(i) && i > 0 && [1, 2, 4, 6].indexOf(i) === -1 && !(i > 4 && i < 8),
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
    "outDisplay" : (i) => userFacingValueAndUnit(i, " metres", feetToMetres, currRound(5)),
    "outDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " metres", feetToMetres, currRound(5)),
    "preprocess" : (input) => {
      const feetAndInchesRegex = 
        new RegExp(( rh.startRegex 
          + rh.numberRegex
          + rh.regexJoinToString(["[\']", " ?ft", " ?" + unitsLookupMap['feet to metres']['unitRegex']])
          + "[- ]?"
          + rh.numberRegex
          + rh.regexJoinToString([/["]/, / ?in/, " ?" + unitsLookupMap['in to cm']['unitRegex']])
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
    },
    "ignoredKeywords" : ["size"]
  },

  "in to cm" : {
    "unitRegex" : rh.regexJoinToString([/-in/, /-?inch/, /inches/]),
    "weakUnitsRegex" : rh.regexJoinToString([/["]/, /in/, /''/]),
    "shouldConvert" : (i) => isNotHyperbole(i) && i > 0 && i != 1,
    "inDisplay" : (i) => userFacingValueAndUnit(i, " inches"),
    "inDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " inches"),
    "outDisplay" : (i) => userFacingValueAndUnit(i, " cm", inchesToCm, currRound(5)),
    "outDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " cm", inchesToCm, currRound(5)),
    "ignoredKeywords" : ["monitor", "screen", "tv", 
                        "ipad", "iphone", "phone", "tablet", 
                        "apple", "windows", "linux", "android", "ios",
                        "macbook", "laptop", "computer", "notebook", "imac", "pc", "dell", "thinkpad", "lenovo",
                        "rgb", "hz",]
  },

  "lb to kg" : {
    "unitRegex" : "-?lbs?",
    "weakUnitsRegex" : rh.regexJoinToString([/-?pound/, /pounds/]),
    "shouldConvert" : (i) => isNotHyperbole(i) && i > 0,
    "inDisplay" : (i) => userFacingValueAndUnit(i, " lb"),
    "inDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " lb"),
    "outDisplay" : (i) => userFacingValueAndUnit(i, " kg", lbToKg, currRound(5)),
    "outDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " kg", lbToKg, currRound(5)),
  },

  "miles to km" : {
    "unitRegex" : rh.regexJoinToString([/mi/, /-?miles?/]),
    "shouldConvert" : (i) => isNotHyperbole(i) && i > 0 && [1, 8, 10].indexOf(i) === -1,
    "inDisplay" : (i) => userFacingValueAndUnit(i, " miles"),
    "inDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " miles"),
    "outDisplay" : (i) => userFacingValueAndUnit(i, " km", milesToKm, currRound(5)),
    "outDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " km", milesToKm, currRound(5)),
    "ignoredKeywords" : ["churn", "credit card", "visa", "mastercard", "awardtravel",
                         "air miles", "aeroplan", "points",
                         "britain", "british", "england", "scotland", "wales", "uk",
                         "italy", "italian", "croatia", "brasil", "brazil"]
  },

  "°F to °C" : {
    "unitRegex" : rh.regexJoinToString([
                    /(?:°|-?degrees?) ?(?:f|fahrenheit)/,
                    /fahrenheit/
                  ]),
    "weakUnitsRegex" : rh.regexJoinToString([/f/, /-?degrees?/]),
    "inDisplay" : (i) => userFacingValueAndUnit(i, "°F"),
    "inDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, "°F"),
    "outDisplay" : (i) => userFacingValueAndUnit(i, "°C", fahrenheitToCelsius, Math.round),
    "outDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, "°C", fahrenheitToCelsius, Math.round)
    // "ignoredKeywords" : ["i am", /i'?m/,
    //                      "bodybuilding", "relationships", "nanny"]
  }
};

const globalIgnore = [/(?:\n|^)(?:>|&gt;).*/,

                      "kill", "suicide", "death", "die", "depression", "crisis", "emergency", "therapy", "therapist", "murder", "rip", "rest in peace", "fatal",

                      "america", "usa", "united states",

                      "dick", "penis", "dong", "cock", "member", "phallus", "wood", "willy", "pecker", "manhood", "boner", "junk", "wiener", "shaft", "dildo",
                      "genitalia", "clit", "labia", "pussy", "vagina", "snatch",
                      "ass", "anus", "anal", "butt", "tit", "kink", "bdsm", "blow job", "jizz", "cum",
                      "nsfw", "gonewild", "sex", "glory hole", "cuck", "porn", "incest", "piv", "milf"]
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
