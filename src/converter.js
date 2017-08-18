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
  return formatConversion(input, (i) => i * 0.3048, 3);
}

function inchesToCm(input) {
  return formatConversion(input, (i) => i * 2.54, 10);
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

  return addCommas(roundNumberToDecimalPlaces(convertedValue, decimals));
}

function roundNumberToDecimalPlaces(number, places) {
  const multiplier = Math.pow(10, places);
  return ((Math.round(number * multiplier)/multiplier).toFixed(places));
}

function removeCommas(x) {
  return x.replace(/,/g,'');
}

function addCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

Array.prototype.regexJoin = function() {
  return "(?:" + this.map(el => {
    const source = el.source
    if (source) {
      return source;
    } else {
      return el;
    }
  }).join("|") + ")";
}

String.prototype.regex = function() {
  return new RegExp(this, "gi");
}

const startRegex 
  = /(?:^|[\s~><\b])/.source;

const endRegex 
  = /(?:$|[\s-\.,;?!:\b])/.source;

const numberRegex 
  = 
  "("
    + "(?:"
      + /-?/.source
      + [
          /\d+/,
          /\d{1,3}(?:,\d{3})+/
        ].regexJoin() 
      + /(?:\.\d+)?/.source
    + ")"
    + "|"
    + "(?:"
      + /(?:\.\d+)/.source
    + ")"
  + ")";

const rangeRegex
  = numberRegex
  + / ?(?:-|to) ?/.source
  + numberRegex;

//Pull out this code into its own file, story #150356133
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
  "feet to meters": {
    "unitRegex" : [/-?feet/, /-?ft/, /-?foot/, /'/].regexJoin(),
    "conversionFunction" : feetToMeters,
    "inUnits" : (num) => num == 1 ? " foot" : " feet",
    "outUnits" : (num) => num == 1 ? " meter" : " meters",
    "excludeHyperbole" : true,
    "onlyPositiveValues" : true,
    "preprocess" : (input) => {
      const feetAndInchesRegex = 
        (
          startRegex 
          + numberRegex
          + [/[']/, "[ -]?" + unitsLookupMap['feet to meters']['unitRegex'] + "[ -]?"].regexJoin()
          + numberRegex
          + [/["]/, "[ -]?(?:" + unitsLookupMap['in to cm']['unitRegex']].regexJoin() + "|in)"
          + endRegex
        ).regex();
      return input.replace(feetAndInchesRegex, (match, feet, inches, offset, string) => {
        return " " + roundNumberToDecimalPlaces(Number(feet) + Number(inches)/12, 1) + "ft";
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

function conversions(input) {
  return Object.keys(unitsLookupMap)
  //Workaround: longest key is processed first so "miles per hour" will not be read as "miles"
  .sort((a, b) => b.length - a.length)
  .reduce((memo, key) => {
    const map = unitsLookupMap[key];

    if (map['preprocess']) {
      input = map['preprocess'](input);
    }

    const completeRangeRegex = (startRegex + rangeRegex + "(?= ?" + map['unitRegex'] + endRegex + ")").regex();
    const rangeMatches = input.match(completeRangeRegex);
    if (rangeMatches) {
      rangeMatches
        .map(range => {
          input = input.replace((range + " ?" + map['unitRegex']).regex(), '');
          return range;
        })
        .map(range => range.replace(/to/g, "-").replace(/[^\d.-]/g, ''))
        .forEach(range => {
          const toIndex = range.match(/\d-(?=-?\d)/).index + 1;

          const fromNumber = range.substring(0, toIndex);
          const toNumber = range.substring(toIndex + 1);

          const inUnits = (map['inUnits'] instanceof Function) ? map['inUnits'](toNumber) : map['inUnits'];
          
          const outFromNumber = map['conversionFunction'](fromNumber);
          const outToNumber = map['conversionFunction'](toNumber);

          const outUnits = (map['outUnits'] instanceof Function) ? map['outUnits'](outToNumber) : map['outUnits'];

          memo[fromNumber + " to " + toNumber + inUnits] = outFromNumber + " to " + outToNumber + outUnits;
        });
    }

    const completeNumberRegex = (startRegex + numberRegex + "(?= ?" + map['unitRegex'] + endRegex + ")").regex();
    const numberMatches = input.match(completeNumberRegex);
    if (numberMatches) {
      numberMatches
        .map(match => {
          input = input.replace((match + " ?" + map['unitRegex']).regex(), '');
          return match;
        })
        .map(match => match.replace(/[^\d.-]/g, ''))
        .forEach(number => {
          function shouldProcessNumber(number) {
            const isInvalidHyperbole = map['excludeHyperbole'] && number.match(/^100+(?:\.0+)?$/);
            const isInvalidNegative = map['onlyPositiveValues'] && number <= 0;
            return !isInvalidHyperbole && !isInvalidNegative;
          }

          if (shouldProcessNumber(number)) {
            const inUnits = (map['inUnits'] instanceof Function) ? map['inUnits'](number) : map['inUnits'];
            const alreadyConverted = Object.keys(memo).reduce((m, k) => {
              return k.indexOf("to " + addCommas(number) + inUnits) != -1 || m;
            }, false);
            if (alreadyConverted) {
              return;
            }
            const outNumber = map['conversionFunction'](number);
            const outUnits = (map['outUnits'] instanceof Function) ? map['outUnits'](outNumber) : map['outUnits'];
            memo[addCommas(number) + inUnits] = outNumber + outUnits;
          }
        });
    }
    return memo;
  }, {});
}

module.exports = {
  "conversions" : conversions
}
