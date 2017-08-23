const rh = require('./regex_helper');

const unitsLookupMap = require('./units_lookup_map').unitsLookupMap;

function conversions(input) {
  return Object.keys(unitsLookupMap)
  //Workaround: longest key is processed first so "miles per hour" will not be read as "miles"
  .sort((a, b) => b.length - a.length)
  .reduce((memo, key) => {
    const map = unitsLookupMap[key];

    function formattedConversion(input) {
      const oneDecimalPointThreshold = map['precisionThreshold'];
      const convertedValue = map['conversionFunction'](input);

      let decimals;

      if (input.indexOf('.') !== -1) {
        decimals = input.split(".")[1].length;
      } else if (oneDecimalPointThreshold && convertedValue < oneDecimalPointThreshold) {
        decimals = 1;
      } else {
        decimals = 0;
      }

      return rh.roundToDecimalPlaces(convertedValue, decimals).addCommas();
    }

    if (map['preprocess']) {
      input = map['preprocess'](input);
    }

    const completeRangeRegex = (rh.startRegex + rh.rangeRegex + "(?= ?" + map['unitRegex'] + rh.endRegex + ")").regex();
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

          const in1 = range.substring(0, toIndex);
          const in2 = range.substring(toIndex + 1);

          const inUnits = (map['inUnits'] instanceof Function) ? map['inUnits'](in2) : map['inUnits'];
          
          const out1 = formattedConversion(in1);
          const out2 = formattedConversion(in2);

          const outUnits = (map['outUnits'] instanceof Function) ? map['outUnits'](out2) : map['outUnits'];

          let outRange;
          if (out1 == out2) {
            outRange = out1 + outUnits;
          } else {
            outRange = out1 + " to " + out2 + outUnits;
          }

          memo[in1.addCommas() + " to " + in2.addCommas() + inUnits] = outRange;
        });
    }

    const completeNumberRegex = (rh.startRegex + rh.numberRegex + "(?= ?" + map['unitRegex'] + rh.endRegex + ")").regex();
    const numberMatches = input.match(completeNumberRegex);
    if (numberMatches) {
      numberMatches
        .map(match => {
          match = match.replace(/\(/, "\\(").replace(/\)/, "\\)");
          input = input.replace((match + " ?" + map['unitRegex']).regex(), '');
          return match;
        })
        .map(match => match.replace(/[^\d.-]/g, ''))
        .forEach(number => {
          const outNumber = formattedConversion(number);

          function shouldProcessNumber(number) {
            const alreadyConvertedInComment = input.match(outNumber);
            let shouldConvert = true;
            if (map['shouldConvert']) {
              shouldConvert = map['shouldConvert'](number);
            }
            return shouldConvert && !alreadyConvertedInComment;
          }

          if (shouldProcessNumber(number)) {
            const inUnits = (map['inUnits'] instanceof Function) ? map['inUnits'](number) : map['inUnits'];
            const alreadyConverted = Object.keys(memo).reduce((m, k) => {
              return k.indexOf("to " + number.addCommas() + inUnits) != -1 || m;
            }, false);
            if (alreadyConverted) {
              return;
            }
            const outUnits = (map['outUnits'] instanceof Function) ? map['outUnits'](outNumber) : map['outUnits'];
            memo[number.addCommas() + inUnits] = outNumber + outUnits;
          }
        });
    }
    return memo;
  }, {});
}

module.exports = {
  "conversions" : conversions
}
