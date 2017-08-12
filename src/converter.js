Array.prototype.regexJoin = function() {
  return "(?:" + this.map(el => el.source).join("|") + ")";
}

String.prototype.regex = function() {
  return new RegExp(this, "gi");
}

function fahrenheitToCelsius(f) {
  return addCommas(Math.round(((f - 32) * 5/9)));
}

function milesToKilometers(s) {
  var decimals;

  if (s.indexOf('.') !== -1) {
    decimals = s.split(".")[1].length;
  } else if (s < 5) {
    decimals = 1;
  } else {
    decimals = 0;
  }

  const multiplier = Math.pow(10, decimals);
  return addCommas((Math.round(s * 1.609344 * multiplier)/multiplier).toFixed(decimals));
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
  = /(?:^|[\s-])/.source;

const endRegex 
  = /(?:$|[\s,-])/.source;

const numberRegex 
  = "(" + /-?/.source
  + [
      /\d+/,
      /\d{1,3}(?:,\d{3})+/
    ].regexJoin() 
  + /(?:\.\d+)?/.source + ")";

const rangeRegex
  = numberRegex
  + / ?(?:-|to) ?/.source
  + numberRegex;

const unitsLookupMap = {
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
    "excludeZeroValue" : false
  },
  "miles to kilometers": {
    "unitRegex" : [/mi/, /miles?/].regexJoin(),
    "conversionFunction" : milesToKilometers,
    "inUnits" : (num) => num == 1 ? " mile" : " miles",
    "outUnits" : " km",
    "excludeHyperbole" : true,
    "excludeZeroValue" : true
  },
  "miles per hour": {
    "unitRegex" : "mph",
    "conversionFunction" : milesToKilometers,
    "inUnits" : " mph",
    "outUnits" : " km/h",
    "excludeHyperbole" : true,
    "excludeZeroValue" : true
  }
}

function conversions(input) {
  function shouldProcessInput(input) {
    const hasNumber = input.match(numberRegex.regex());
    const writtenByBot = input.match(/\bbot\b/g);
    const postIsShort = input.length < 300;

    return hasNumber && !writtenByBot && postIsShort;
  }

  if (!shouldProcessInput(input)) {
    return {};
  }

  return Object.keys(unitsLookupMap).reduce((memo, key) => {
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
            const isInvalidZero = map['excludeZeroValue'] && number.match(/^0+(?:\.0+)?$/);
            return !isInvalidHyperbole && !isInvalidZero;
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
