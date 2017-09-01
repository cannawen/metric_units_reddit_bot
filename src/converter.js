const rh = require('./regex_helper');

const unitsLookupMap = require('./units_lookup_map').unitsLookupMap;

function conversions(comment) {
  const input = comment['body'];
  const subreddit = comment['subreddit'];
  const postTitle = comment['postTitle'];
  
  let matches = highConfidenceMatches(input, subreddit, postTitle);

  if (Object.keys(matches).length > 0) {
    matches = Object.assign(matches, lowConfidenceMatches(input));
  }

  return matches;
}

function lowConfidenceMatches(input) {
  return Object.keys(unitsLookupMap)
    //Workaround: longest key is processed first so "miles per hour" will not be read as "miles"
    .sort((a, b) => b.length - a.length)
    .reduce((memo, key) => {
      const map = unitsLookupMap[key];

      if (map['preprocess']) {
        input = map['preprocess'](input);
      }

      const completeRangeRegex = new RegExp(rh.startRegex + rh.rangeRegex + "(?= ?" + map['weakUnitsRegex'] + rh.endRegex + ")", 'gi');
      const rangeMatches = input.match(completeRangeRegex);
      if (rangeMatches) {
        rangeMatches
          .map(range => {
            range = range.replace(/\(/, "\\(").replace(/\)/, "\\)");
            input = input.replace(new RegExp(range + " ?" + map['weakUnitsRegex'], 'gi'), '');
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

      const completeNumberRegex = new RegExp(rh.startRegex + rh.numberRegex + "(?= ?" + map['weakUnitsRegex'] + rh.endRegex + ")", 'gi');
      const numberMatches = input.match(completeNumberRegex);
      if (numberMatches) {
        numberMatches
          .map(match => {
            match = match.replace(/\(/, "\\(").replace(/\)/, "\\)");
            input = input.replace(new RegExp(match + " ?" + map['weakUnitsRegex'], 'gi'), '');
            return match;
          })
          .map(match => match.replace(/[^\d.-]/g, ''))
          .forEach(number => {
            const outValueAndUnit = map['outDisplay'](number);
            const inValueAndUnit = map['inDisplay'](number);
            
            memo[inValueAndUnit] = outValueAndUnit;
          });
      }
      return memo;
    }, {});
}

function highConfidenceMatches(input, subreddit, postTitle) {
  return Object.keys(unitsLookupMap)
    //Workaround: longest key is processed first so "miles per hour" will not be read as "miles"
    .sort((a, b) => b.length - a.length)
    .reduce((memo, key) => {
      const map = unitsLookupMap[key];

      if (map['preprocess']) {
        input = map['preprocess'](input);
      }

      const completeRangeRegex = new RegExp(rh.startRegex + rh.rangeRegex + "(?= ?" + map['unitRegex'] + rh.endRegex + ")", 'gi');
      const rangeMatches = input.match(completeRangeRegex);
      if (rangeMatches) {
        rangeMatches
          .map(range => {
            range = range.replace(/\(/, "\\(").replace(/\)/, "\\)");
            input = input.replace(new RegExp(range + " ?" + map['unitRegex'], 'gi'), '');
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

      const completeNumberRegex = new RegExp(rh.startRegex + rh.numberRegex + "(?= ?" + map['unitRegex'] + rh.endRegex + ")", 'gi');
      const numberMatches = input.match(completeNumberRegex);
      if (numberMatches) {
        numberMatches
          .map(match => {
            match = match.replace(/\(/, "\\(").replace(/\)/, "\\)");
            input = input.replace(new RegExp((match + " ?" + map['unitRegex']), 'gi'), '');
            return match;
          })
          .map(match => match.replace(/[^\d.-]/g, ''))
          .forEach(number => {
            const outValueAndUnit = map['outDisplay'](number);
            const inValueAndUnit = map['inDisplay'](number);

            function shouldProcessNumber(number) {
              const outNumber = outValueAndUnit.replace(/[^\d\.-]/g, '');
              const alreadyConvertedInComment = input.match(outNumber);
              let containsIgnoredKeywork = false;

              if (map['ignoredKeywords']) {
                const ignoredWordRegex = new RegExp(rh.startRegex
                  + rh.regexJoinToString(map['ignoredKeywords'])
                  + rh.endRegex
                , 'i');

                containsIgnoredKeywork = input.match(ignoredWordRegex)
                containsIgnoredKeywork = postTitle.match(ignoredWordRegex) || containsIgnoredKeywork
                containsIgnoredKeywork = subreddit.match(new RegExp(rh.regexJoinToString(map['ignoredKeywords']), 'i')) || containsIgnoredKeywork
              }

              const alreadyConvertedInMap = Object.keys(memo).reduce((m,k) => {
                const value = inValueAndUnit.replace(/[^'"\d\.,-]/g,'');
                const unit = inValueAndUnit.replace(value, '');
                return k.match(new RegExp("(^| )" + value + ".*" + unit), 'gi') !== null || m;
              }, false);

              let isValidConversionNumber = true;
              if (map['shouldConvert']) {
                isValidConversionNumber = map['shouldConvert'](Number(number));
              }
              return isValidConversionNumber && !alreadyConvertedInComment && !alreadyConvertedInMap && !containsIgnoredKeywork;
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
