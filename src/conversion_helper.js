const rh = require('./regex_helper');
const fsh = require('./file_system_helper');

const metricForceUnits = [/newtons?/, /dynes?/];

const ukSubreddits = ["britain", "british", "england", "english", "scotland", "scottish", "wales", "welsh", "ireland", "irish", "london", "uk"];

/*
  Units at the start of the list will take precedence over units later (so "miles per hour" takes precedence over "miles")

  Here is a description of what each key in the objects means:

  imperialUnits - A list of regular expressions (or strings that will be passed into new RegExp()) that are used to find the imperial units we want to replace.

  weakImperialUnits (optional) - A list of sometimes-used units (i.e. "in" for inch), that should only be converted if a different unit of the same kind (i.e. "inch") has been used in the post

  standardInputUnit - The unit string that will be displayed to the user at the end of the conversion

  isInvalidInput - These inputs should definitely not be converted (i.e. a negative distance)

  isWeaklyInvalidInput - These input should probably not be converted (i.e. 8 Mile, the movie, or 1000000 miles, a hyperbole)

  conversionFunction - A function that gets passed in a number, and returns the metric conversion in the form
    {
      numbers: metric-number,
      unit: metric-unit
    }

  ignoredUnits (optional) - If the OP has already converted the units, regardless of case sensitivity, we don't want to duplicate their efforts! 

  ignoredKeywords (optional) - Sometimes people yell at us for converting football yards to metric. So here is where we throw keywords that we don't want to convert

  preprocess (optional) - A function that runs before any conversions are done that takes the comment and changes the input string into a more easily parsed format (i.e. 6'6" to 6.5 feet)

  postprocess (optional) - A function that runs after all conversions have been done that takes the imperial input (6.5 feet) and converts it to a better format (6'6")
*/
let unitLookupList = [
  {
    "imperialUnits" : [/(?:pounds?|lbs?)\/(?:inch|in)/] ,
    "standardInputUnit" : " lbs/inch",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => {return [createMap(i.map((j) => j * 0.017858), " kg/mm"), createMap(i.map((j) => j * 175.126835), " N/m")]},  // 1 lbs/inch = 0.017858 kg/mm
    "ignoredUnits" : [/newton[ -]?met(?:er|re)s?/, /Nm/, /kg\/mm/]
  },
  {
    "imperialUnits" : [/(?:foot|ft)[ -·]?(?:pounds?|lbf?|lbs?)/, /(?:pounds?|lbs?)[ -·]?(?:foot|fts?)/],
    "standardInputUnit" : " ft·lbf",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : (i) => isHyperbole(i) || i === 8,
    "conversionFunction" : (i) => createMap(i.map((j) => j * 1.355818), " Nm"),
    "ignoredUnits" : [/newton[ -]?met(?:er|re)s?/, /Nm/, /joule/]
  },
  {
    "imperialUnits" : [/pounds?[ -]?(?:force)/, /lbf/, /lbs?[ -]?(?:force)/],
    "standardInputUnit" : " lbf",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => createMap(i.map((j) => j * 4.44822), " N"),
    "ignoredUnits" : metricForceUnits
  },
  {
    "imperialUnits" : [/(?:°|degrees?) ?(?:f|fahrenheit)/, /fahrenheit/],
    "weakImperialUnits" : ["f", "degrees?"],
    "standardInputUnit" : "°F",
    "isInvalidInput" : (i) => false,
    "isWeaklyInvalidInput" : (i) => i > 1000,
    "conversionFunction" : (i) => {
      const temperatureMap = createMap(i.map((j) => (j - 32) * 5/9), "°C");
      const unitDecider = Math.max(...i);
      if (unitDecider > 0 && unitDecider < 32) {
        return [temperatureMap, createMap(i.map((j) => j * 5/9), " change in °C")];
      } else {
        return temperatureMap;
      }
    },
    "ignoredUnits" : [/° ?C/, "degrees? c", "celsius", "kelvin"]
  }
];

const units = fsh.getAllPaths(__dirname + '/conversion').map(require);
unitLookupList = unitLookupList.concat(units);
unitLookupList.sort((a, b) => {
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

function createMap(value, unit) {
  return {
    "numbers" : value.map((i) => i.toString()),
    "unit" : unit
  };
}

function isZeroOrNegative(i) {
  return i <= 0;
}

function isHyperbole(i) {
  const isOneFollowedByZeros = i.toString().match(/^100+(?:\.0+)?$/) !== null;
  const isOneFollowedByExponentTerm = i.toString().match(/1e(?:\d)*/) !== null;
  return isOneFollowedByZeros || isOneFollowedByExponentTerm;
}

function roundToDecimalPlaces(number, places) {
  const multiplier = Math.pow(10, places);
  return (Math.round(number * multiplier)/multiplier).toFixed(places);
}

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
