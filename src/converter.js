Array.prototype.regexJoin = function() {
  return "(?:" + this.map(el => el.source).join("|") + ")";
}

String.prototype.regex = function() {
  return new RegExp(this, "gi");
}

function fahrenheitToCelsius(input) {
  return formatConversion(input, (i) => (i - 32) * 5/9);
}

function milesToKilometers(input) {
  return formatConversion(input, (i) => i * 1.609344, 10);
}

function mpgToLper100km(input) {
  return formatConversion(input, (i) => 235.215 / i, 10);
}

function formatConversion(input, conversionFunction, threshold) {
  let decimals;

  const converted = conversionFunction(input);

  if (input.indexOf('.') !== -1) {
    decimals = input.split(".")[1].length;
  } else if (threshold && converted < threshold) {
    decimals = 1;
  } else {
    decimals = 0;
  }

  const multiplier = Math.pow(10, decimals);
  return addCommas((Math.round(converted * multiplier)/multiplier).toFixed(decimals));
}

function removeCommas(x) {
  return x.replace(/,/g,'');
}

function addCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

const startRegex 
  = /(?:^|[\s~><\b])/.source;

const endRegex 
  = /(?:$|[\s-\.,;?!:\b])/.source;

const numberRegex 
  = "((?:"
  + /-?/.source
  + [
      /\d+/,
      /\d{1,3}(?:,\d{3})+/
    ].regexJoin() 
  + /(?:\.\d+)?/.source
  + ")|(?:"
  + /(?:\.\d+)/.source
  + "))";

const rangeRegex
  = numberRegex
  + / ?(?:-|to) ?/.source
  + numberRegex;

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
    "unitRegex" : [/mph/, /miles per hour/].regexJoin(),
    "conversionFunction" : milesToKilometers,
    "inUnits" : " mph",
    "outUnits" : " km/h",
    "excludeHyperbole" : true,
    "onlyPositiveValues" : true
  },
  "miles to km": {
    "unitRegex" : [/mi/, /miles?/].regexJoin(),
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
    const unitRegex = map['unitRegex'];
    const excludeHyperbole = map['excludeHyperbole'];

    const completeRangeRegex = (startRegex + rangeRegex + "(?= ?" + unitRegex + endRegex + ")").regex();
    const rangeMatches = input.match(completeRangeRegex);
    if (rangeMatches) {
      rangeMatches
        .map(range => {
          input = input.replace((range + " ?" + unitRegex).regex(), '');
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
          const outRange = outFromNumber + " to " + outToNumber;

          const outUnits = (map['outUnits'] instanceof Function) ? map['outUnits'](outToNumber) : map['outUnits'];

          memo[fromNumber + " to " + toNumber + inUnits] = outRange + outUnits;
        })
    }

    const completeNumberRegex = (startRegex + numberRegex + "(?= ?" + unitRegex + endRegex + ")").regex();
    const numberMatches = input.match(completeNumberRegex);
    if (numberMatches) {
      numberMatches
        .map(match => {
          input = input.replace((match + " ?" + unitRegex).regex(), '');
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
