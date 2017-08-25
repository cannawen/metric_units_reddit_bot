const rh = require('./regex_helper');

const unitsLookupMap = require('./units_lookup_map').unitsLookupMap;

function conversions(input) {
  return Object.keys(unitsLookupMap)
  //Workaround: longest key is processed first so "miles per hour" will not be read as "miles"
  .sort((a, b) => b.length - a.length)
  .reduce((memo, key) => {
    const map = unitsLookupMap[key];

    if (map['preprocess']) {
      input = map['preprocess'](input);
    }

    const completeRangeRegex = (rh.startRegex + rh.rangeRegex + "(?= ?" + map['unitRegex'] + rh.endRegex + ")").regex();
    const rangeMatches = input.match(completeRangeRegex);
    if (rangeMatches) {
      rangeMatches
        .map(range => {
          range = range.replace(/\(/, "\\(").replace(/\)/, "\\)");
          input = input.replace((range + " ?" + map['unitRegex']).regex(), '');
          return range;
        })
        .map(range => range.replace(/to/gi, "-").replace(/[^\d.-]/g, ''))
        .forEach(range => {
          const toIndex = range.match(/\d-(?=-?\d)/).index + 1;

          const in1 = range.substring(0, toIndex);
          const in2 = range.substring(toIndex + 1);

          memo[map['inDisplayRange'](in1, in2)] = map['outDisplayRange'](in1, in2);
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
          const outValueAndUnit = map['outDisplay'](number);
          const inValueAndUnit = map['inDisplay'](number);

          function shouldProcessNumber(number) {
            const outNumber = outValueAndUnit.replace(/[^\d\.-]/g, '');
            const alreadyConvertedInComment = input.match(outNumber);

            const alreadyConvertedInMap = Object.keys(memo).reduce((m,k) => {
              const value = inValueAndUnit.replace(/[^'"\d\.,-]/g,'');
              const unit = inValueAndUnit.replace(value, '');
              return k.match(("(^| )" + value + ".*" + unit).regex()) !== null || m;
            }, false);

            let shouldConvert = true;
            if (map['shouldConvert']) {
              shouldConvert = map['shouldConvert'](Number(number));
            }
            return shouldConvert && !alreadyConvertedInComment && !alreadyConvertedInMap;
          }

          if (shouldProcessNumber(number)) {
            memo[inValueAndUnit] = outValueAndUnit;
          }
        });
    }
    return memo;
  }, {});
}

module.exports = {
  "conversions" : conversions
}
