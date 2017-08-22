const rh = require('./regex_helper');

function fahrenheitToCelsius(input) {
  return formatConversion(input, (i) => (i - 32) * 5/9);
}

function milesToKilometers(input) {
  return formatConversion(input, (i) => i * 1.609344, 10);
}

function mpgToLper100km(input) {
  return formatConversion(input, (i) => 235.215 / i, 10);
}

function feetToMeters(input) {
  return formatConversion(input, (i) => i * 0.3048, 100);
}

function inchesToCm(input) {
  return formatConversion(input, (i) => i * 2.54, 10);
}

function roundNumberToDecimalPlaces(number, places) {
  const multiplier = Math.pow(10, places);
  return ((Math.round(number * multiplier)/multiplier).toFixed(places));
}

function removeCommas(x) {
  return x.replace(/,/g,'');
}

function formatConversion(input, conversionFunction, oneDecimalPointThreshold) {
  let decimals;

  const convertedValue = conversionFunction(input);

  if (input.indexOf('.') !== -1) {
    decimals = input.split(".")[1].length;
  } else if (oneDecimalPointThreshold && convertedValue < oneDecimalPointThreshold) {
    decimals = 1;
  } else {
    decimals = 0;
  }

  return roundNumberToDecimalPlaces(convertedValue, decimals).addCommas();
}

const unitsLookupMap = {
  //Workaround: longest key is processed first so "miles per hour" will not be read as "miles"
  "miles per gallon to L/100km" : {
    "unitRegex" : [/mpg/, /miles per gallon/].regexJoin(),
    "conversionFunction": mpgToLper100km,
    "inUnits" : " mpg (US)",
    "outUnits" : " L/100km",
    "excludeHyperbole" : true,
    "onlyPositiveValues" : true
  },

  "miles per hour to km/h": {
    "unitRegex" : [/mph/, /miles per hour/, /miles an hour/].regexJoin(),
    "conversionFunction" : milesToKilometers,
    "inUnits" : " mph",
    "outUnits" : " km/h",
    "excludeHyperbole" : true,
    "onlyPositiveValues" : true
  },

  "feet to metres": {
    "unitRegex" : [/-?feet/, /-?ft/, /-?foot/].regexJoin(),
    "conversionFunction" : feetToMeters,
    "inUnits" : (num) => num == 1 ? " foot" : " feet",
    "outUnits" : (num) => num == 1 ? " metre" : " metres",
    "excludeHyperbole" : true,
    "onlyPositiveValues" : true,
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
        return " " + roundNumberToDecimalPlaces(Number(feet) + Number(inches)/12, 2) + "ft";
      });
    }
  },

  "in to cm": {
    "unitRegex" : [/-in/, /-?inch/, /inches/].regexJoin(),
    "conversionFunction" : inchesToCm,
    "inUnits": (num) => num == 1 ? " inch" : " inches",
    "outUnits": " cm",
    "excludeHyperbole": true,
    "onlyPositiveValues": true
  },

  "miles to km": {
    "unitRegex" : [/mi/, /-?miles?/].regexJoin(),
    "conversionFunction" : milesToKilometers,
    "inUnits" : (num) => num == 1 ? " mile" : " miles",
    "outUnits" : " km",
    "excludeHyperbole" : true,
    "onlyPositiveValues" : true
  },

  "°F to °C" : {
    "unitRegex" : [
                    /° ?f/, 
                    /degrees? f/,
                    /degrees? fahrenheit/,
                    /fahrenheit/
                  ].regexJoin(),
    "conversionFunction" : fahrenheitToCelsius,
    "inUnits" : "°F",
    "outUnits" : "°C",
    "excludeHyperbole" : false,
    "onlyPositiveValues" : false
  }
}

module.exports = {
  "unitsLookupMap" : unitsLookupMap
}