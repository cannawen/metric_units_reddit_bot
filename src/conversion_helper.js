const rh = require('./regex_helper');
const fsh = require('./file_system_helper');

let unitLookupList = fsh.getAllPaths(__dirname + '/conversion')
  .map(require)
  .sort((a, b) => {
    function maxLength(list) {
      return list.reduce((memo, value) => {
        let stringValue;
        if (value instanceof RegExp) {
          stringValue = value.source;
        } else {
          stringValue = value;
        }

        const currentLength = stringValue.length;
        return currentLength > memo ? currentLength : memo;
      }, 0);
    }
    return maxLength(b.imperialUnits) - maxLength(a.imperialUnits);
  });


const unitLookupMap = unitLookupList.reduce((memo, map) => {
  memo[map['standardInputUnit']] = map;
  return memo;
}, {});

function containsArray(searchSpace, targetArray) {
  for(let i in searchSpace) {
    if(JSON.stringify(searchSpace[i]) === JSON.stringify(targetArray)) {
      return true;
    }
  }
  return false;
}


const globalIgnore = ["kill", "suicide", "death", "die", "depression", "crisis", "emergency", "therapy", "therapist", "murder", "rip", "rest in peace", "fatal", "shooting", "shootings", "casualties", "casualty",

                      "america", "usa", "united states",

                      "dick", "penis", "dong", "cock", "member", "phallus", "wood", "willy", "pecker", "manhood", "boner", "junk", "wiener", "shaft", "dildo",
                      "genitalia", "clit", "labia", "pussy", "vagina", "snatch",
                      "ass", "anus", "anal", "butt", "tit", "kink", "bdsm", "blow job", "jizz", "cum",
                      "nsfw", "gonewild", "sex", "glory hole", "cuck", "porn", "incest", "piv", "milf"]

function shouldConvertComment(comment, regexArray = globalIgnore, shouldBeUniqueWord = true) {
  const input = comment['body'];
  const postTitle = comment['postTitle'];
  const subreddit = comment['subreddit'];

  const ignoredWordRegex = new RegExp(
    (shouldBeUniqueWord ? rh.startRegex : "")
    + rh.regexJoinToString(regexArray)
    + rh.endRegex
  , 'i');

  const hasIgnoredKeyword = input.match(ignoredWordRegex) 
    || postTitle.match(ignoredWordRegex) 
    || subreddit.match(new RegExp(rh.regexJoinToString(regexArray), 'i'));

  const hasQuotedText = input.match(/(^|\n)(>|&gt;)/);
  return hasIgnoredKeyword === null && hasQuotedText === null;
}

/*
  Input: String
    "1-2 mi away at 3 miles an hour"
  Output: Array of input numbers and standardized units
    [
      { "imperial": { "numbers" : [1, 2], "unit" : " miles", "joiner": "-" } },
      { "imperial": { "numbers" : [3], "unit" : " mph" } }
    ]
*/
function findPotentialConversions(comment) {
  function findMatchForUnitsAndRemoveFromString(unitArray, standardUnit, string) {
    let potentialConversions = [];
    const unitRegex = rh.regexJoinToString(unitArray);

    const rangeRegex = new RegExp(rh.startRegex 
                         + rh.rangeRegex 
                         + "(?=[ -]?" 
                           + unitRegex 
                           + rh.endRegex 
                         + ")",
                       'gi');
    const rangeMatches = string.match(rangeRegex);
    if (rangeMatches) {
      rangeMatches
          .map(range => {
            range = range.replace(/\(/, "\\(").replace(/\)/, "\\)");
            string = string.replace(new RegExp(range + " ?" + unitRegex, 'gi'), '');
            return range;
          })
          .map(range => range.replace(/\s/g, ""))
          .forEach(range => {
            const match = range.match(/(?:\d)/.source + rh.rangeJoiners + /(?=-?\d)/.source);
            if (match) {
              const toIndex = match.index + 1;
              const joiner = match[1];

              const in1 = range.substring(0, toIndex).replace(/[^\d-\.]/g, '');
              const in2 = range.substring(toIndex + joiner.length).replace(/[^\d-\.]/g, '');

              potentialConversions.push({
                "imperial": {
                  "numbers" : [in1, in2], 
                  "unit" : standardUnit,
                  "joiner": joiner
                }
              });
            } else {
              analytics.trackError([range, input, subreddit, postTitle])
            }
          });
    }

    const regex = new RegExp(rh.startRegex
                    + rh.numberRegex 
                    + "(?=[ -]?" 
                      + unitRegex
                      + rh.endRegex
                    + ")",
                  'gi');
    const matches = string.match(regex);

    if (matches) {
      matches
        .map(match => {
          match = match.replace(/\(/, "\\(").replace(/\)/, "\\)");
          string = string.replace(new RegExp(match + " ?" + unitRegex, 'gi'), '');
          return match;
        })
        .map(match => match.replace(/[^\d-\.]/g, ''))
        .forEach(match => {
          potentialConversions.push({
            "imperial" : {
              "numbers" : [match], 
              "unit" : standardUnit
            }
          })
        });
    }

    return {
      'potentialConversions' : potentialConversions,
      'string' : string
    };
  }

  //---------------------------------------------------------

  let processedComment = unitLookupList.reduce((memo, map) => {
    if (map["preprocess"]) {
      memo['body'] = map["preprocess"](memo);
      return memo;
    } else {
      return memo;
    }
  }, comment)

  let processedInput = processedComment['body'];

  let duplicateCache = {}

  return unitLookupList.reduce((memo, map) => {
    if (!shouldConvertComment(comment, map['ignoredKeywords']) ||
        !shouldConvertComment(comment, map['ignoredUnits'], false)) {
      return memo;
    }

    const conversions = findMatchForUnitsAndRemoveFromString(
                          map['imperialUnits'],
                          map['standardInputUnit'], 
                          processedInput);

    processedInput = conversions['string'];
    memo = memo.concat(conversions['potentialConversions']);

    if (conversions['potentialConversions'].length > 0) {
      const weakConversions = findMatchForUnitsAndRemoveFromString(
                                map['weakImperialUnits'],
                                map['standardInputUnit'], 
                                processedInput);

      processedInput = weakConversions['string'];
      memo = memo.concat(weakConversions['potentialConversions']);
    }
    return memo;
  }, [])
  //Remove duplicate conversions
  .filter(item => {
    const unit = item['imperial']['unit'];
    const numbers = item['imperial']['numbers'];
    if (duplicateCache[unit] === undefined) {
      duplicateCache[unit] = [numbers];
      return true;
    } else if (!containsArray(duplicateCache[unit], numbers)) {
      duplicateCache[unit].push(numbers);
      return true;
    } else {
      return false;
    }
  });
}

/*
  Input: Array of input numbers and standardized units
    [
      { "imperial": { "numbers" : [10000], "unit" : " miles" } },
      { "imperial": { "numbers" : [-2], "unit" : " miles" } },
      { "imperial": { "numbers" : [3], "unit" : " mph" } }
    ]
  Output: Valid conversions
    [
      { "imperial": { "numbers" : [10000], "unit" : " miles" } },
      { "imperial": { "numbers" : [3], "unit" : " mph" } }
    ]
*/
function filterConversions(potentialConversions) {
  const possiblyValidConversions = potentialConversions.filter(input => {
    const imperialUnit = input['imperial']['unit'];
    const imperialNumbers = input['imperial']['numbers'];

    const map = unitLookupMap[imperialUnit];
    if (map['isInvalidInput']) {
      for(item in imperialNumbers) {
        if(map['isInvalidInput'](Number(imperialNumbers[item]))) {
          return false;
        }
      }
      return true;

    } else {
      return true;
    }
  });

  const stronglyValidInput = possiblyValidConversions.filter(input => {
    const imperialUnit = input['imperial']['unit'];
    const imperialNumbers = input['imperial']['numbers'];

    const map = unitLookupMap[imperialUnit];
    if (map['isWeaklyInvalidInput']) {
      for(item in imperialNumbers) {
        if(map['isWeaklyInvalidInput'](Number(imperialNumbers[item]))) {
          return false;
        }
      }
      return true;

    } else {
      return true;
    }
  })

  if (stronglyValidInput.length == 0) {
    return [];
  } else {
    return possiblyValidConversions;
  }
}

/*
  Input: imperial conversions
    [
      { "imperial" : { "numbers" : [10000], "unit" : " miles" } },
      { "imperial" : { "numbers" : [30], "unit" : " mpg" } }
    ]
  Output: metric and imperial conversions
    [
      { 
        "imperial" : 
          { "numbers" : [10000], "unit" : " miles" }, 
        "metric": 
          { "numbers" : [16093.44], "unit" : " km" } 
      },
      { 
        "imperial" : 
          { "numbers" : [30], "unit" : " mpg" }, 
        "metric" : [
          { "numbers" : [12.7543], "unit" : " km/L" },
          { "numbers" : [7.84049], "unit" : " L/100km" } 
        ]
      }
    ]
*/
function calculateMetric(imperialInputs) {
  return imperialInputs.map(input => {
    const imperialUnit = input['imperial']['unit'];
    const imperialNumbers = input['imperial']['numbers'];

    const map = unitLookupMap[imperialUnit];
    input['metric'] = map['conversionFunction'](imperialNumbers);

    return input;
  });
}

/*
  Input: metric and imperial conversions
    [
      { 
        "imperial" : 
          { "numbers" : [10000], "unit" : " miles" }, 
        "metric": 
          { "numbers" : [16093.44], "unit" : " km" } 
      },
      { 
        "imperial" : 
          { "numbers" : [30], "unit" : " mpg" }, 
        "metric" : [
          { "numbers" : [12.7543], "unit" : " km/L" },
          { "numbers" : [7.84049], "unit" : " L/100km" } 
        ]
      }
    ]
  Output: rounded metric and imperial conversions
    [
      { 
        "imperial" : 
          { "numbers" : [10000], "unit" : " miles" }, 
        "metric": 
          { "numbers" : [16093.44], "unit" : " km" },
        "rounded" :
          { "numbers" : [16000], "unit" : " km" }
      },
      { 
        "imperial" : 
          { "numbers" : [30], "unit" : " mpg" }, 
        "metric" : [
          { "numbers" : [12.7543], "unit" : " km/L" },
          { "numbers" : [7.84049], "unit" : " L/100km" } 
        ],
        "rounded" : [
          { "numbers" : [12.8], "unit" : " km/L" },
          { "numbers" : [7.8], "unit" : " L/100km" } 
        ]
      }
    ]
*/
function roundConversions(conversions) {
  function round(input, allowableErrorPercent) {
    let multiplier;

    if (input.toString().split('.').length > 1) {
      multiplier = Math.pow(10, input.toString().split('.')[1].length)
    } else {
      multiplier = 1;
    }

    if (input < 0) {
      multiplier = multiplier * -1;
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

  function roundToDecimalPlaces(input, decimals) {
      const roundingMultipler = Math.pow(10, decimals)
      const number = Math.round(input * roundingMultipler)/roundingMultipler;
      return number.toFixed(decimals);
  }

  return conversions.map(conversion => {
    function createMetricMap(imperial, metric, unit) {
      let rounded;
      let result = {
        'numbers': [],
        'unit': unit
      };

      result['numbers'] = imperial.map(function(item, index) {
        if (item.toString().indexOf('.') !== -1) {
          const decimals = item.split('.')[1].length;
            return roundToDecimalPlaces(metric[index], decimals);
        } else if ((item > 100 || metric > 100) && item.toString()[item.length - 1] == '0') {
            return round(metric[index], 5).toString();
        } else {
            return round(metric[index], 3).toString();
        }
      });
      return result;
    }

    const metricConversions = conversion['metric'];
    const imperial = conversion['imperial']['numbers'];
    let map;
    if (Array.isArray(metricConversions)) {
      map = metricConversions.map(mc => {
        return createMetricMap(imperial, mc['numbers'], mc['unit'])
      });
    } else {
      map = createMetricMap(imperial, conversion['metric']['numbers'], conversion['metric']['unit'])
    }

    conversion['rounded'] = map;
    return conversion;
  })
}

function formatConversion(conversions) {
  return conversions.map(conversion => {
    const roundedConversions = conversion['rounded'];
    if (Array.isArray(roundedConversions)) {
      conversion['formatted'] = roundedConversions.map(rc => {
        return {
          'numbers': rc['numbers'].map(rh.addCommas),
          'unit': rc['unit']
        };
      });
    } else {
      const metric = conversion['rounded']['numbers'];
      conversion['formatted'] = {
        'numbers': metric.map(rh.addCommas),
        'unit': conversion['rounded']['unit']
      };
    }

    const imperialUnit = conversion['imperial']['unit'];
    const imperialNumbers = conversion['imperial']['numbers'];
    const imperialJoiner = conversion['imperial']['joiner'];

    const postprocessInput = unitLookupMap[imperialUnit]['postprocessInput'];
    if (postprocessInput) {
      conversion['imperial'] = {
        'numbers': postprocessInput(imperialNumbers),
        'unit': ""
      };
      if(imperialJoiner) {
        conversion['imperial']['joiner'] = imperialJoiner;
      }
    } else {
      conversion['imperial']['numbers'] = imperialNumbers.map(rh.addCommas);
    }

    return conversion;
  });
}

module.exports = {
  globalIgnore,
  "shouldConvertComment" : shouldConvertComment,
  "findPotentialConversions" : findPotentialConversions,
  "filterConversions" : filterConversions,
  "calculateMetric" : calculateMetric,
  "roundConversions" : roundConversions,
  "formatConversion" : formatConversion
}
