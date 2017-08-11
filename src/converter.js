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

const startEndRegex 
  = /(?:^|$|[\s\(\)])/.source;

const numberRegex 
  = /-?/.source
  + [
      /\d+/,
      /\d{1,3}(?:,\d{3})+/
    ].regexJoin() 
  + /(?:\.\d+)?/.source;

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
    "inUnits" : " miles",
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

    const completeRegex = (startEndRegex + numberRegex + "(?= ?" + unitRegex + startEndRegex + ")").regex();
    const matches = input.match(completeRegex);

    if (!matches) {
      return memo;
    }

    function cleanupNumber(input) {
      return input.replace(/[^\d.-]/g, '');
    }
    matches
      .map(cleanupNumber)
      .forEach(number => {
        function shouldProcessNumber(number) {
          const isInvalidHyperbole = map['excludeHyperbole'] && number.match(/^100+(?:\.0+)?$/);
          const isInvalidZero = map['excludeZeroValue'] && number.match(/^0+(?:\.0+)$/);
          return !isInvalidHyperbole && !isInvalidZero;
        }
        if (shouldProcessNumber(number)) {
          memo[addCommas(number) + map['inUnits']] = map['conversionFunction'](number) + map['outUnits'];
        }
      });
    return memo;
  }, {});
}

module.exports = {
  "conversions" : conversions
}
