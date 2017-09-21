const rh = require('./regex_helper');

function distanceMap(m) {
  if (m < 0.01) {
    return createMap(m * 1000, " mm");

  } else if (m < 1) {
    return createMap(m * 100, " cm");

  } else if (m >= 1000) {
    return createMap(m/1000, " km");

  } else {
    return createMap(m, " metres");
  }
}

const unitLookupList = [
  {
    "imperialUnits" : [/-?mpg/, /miles per gal(?:lon)?/],
    "standardInputUnit" : " mpg (US)",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyValidInput" : isHyperbole,
    "conversionFunction" : (i) => {
      const kmPerL = createMap(i * 0.425144, " km/L");
      if (i < 15) {
        return kmPerL;
      } else {
        return [
          kmPerL,
          createMap(235.215 / i, " L/100km")
        ]
      }
    },
    "ignoredKeywords" : ["L/100km", "km/L",

                         "basketball", "hockey", "soccer", "football", "rugby", "lacrosse", "cricket", "volleyball", "polo",
                         "nba", "nhl", "nfl", "sport",
                         "play", "game",
                         "britain", "british", "england", "scotland", "wales", "uk"]
  },
  {
    "imperialUnits" : [/-?mph/, /miles (?:an|per) hour/],
    "standardInputUnit" : " mph",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyValidInput" : (i) => isHyperbole(i) || [60, 88].indexOf(i) !== -1,
    "conversionFunction" : (i) => createMap(i * 1.609344, " km/h"),
    "ignoredKeywords" : ["km/h", "kph", "kilometers? ?(?:per|an|/) ?hour", "m/s",

                         "britain", "british", "england", "scotland", "wales", "uk"]
  },
  {
    "imperialUnits" : [/-?feet/, /-ft/, /-?foot/],
    "weakImperialUnits" : [/[']/, /ft/],
    "standardInputUnit" : " feet",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyValidInput" : (i) => isHyperbole(i) || [1, 2, 4, 6].indexOf(i) !== -1,
    "conversionFunction" : (i) => distanceMap(i * 0.3048),
    "preprocess" : (input) => {
      const feetAndInchesRegex = 
        new RegExp(( rh.startRegex 
          + rh.numberRegex
          + rh.regexJoinToString(["[\']", " ?ft", /[- ]?feet/, /[- ]?ft/, /[- ]?foot/])
          + "[- ]?"
          + rh.numberRegex
          + rh.regexJoinToString([/["]/, / ?in/, /-in/, /[- ]?inch/, /[- ]?inches/])
        ),'gi');
      return input.replace(feetAndInchesRegex, (match, feet, inches, offset, string) => {
        const inchesLessThan12 = inches <= 12;
        const inchesLessThan3CharactersBeforeDecimal = inches
            .toString()
            .split('.')[0]
            .replace(/[^\d\.]/,'')
            .length <= 2
        if (inchesLessThan12 && inchesLessThan3CharactersBeforeDecimal) {
          const feetNumeral = roundToDecimalPlaces(Number(feet.replace(/[^\d-\.]/g, '')) + Number(inches)/12, 2);
          return " " + feetNumeral + " feet ";
        } else {
          return "  ";
        }
      });
    },
    "postprocessInput" : (input) => {
      if (input.toString().indexOf('.') == -1) {
        return rh.addCommas(input) + " feet";
      } else {
        return rh.addCommas(Math.floor(input).toString()) + "'" 
               + roundToDecimalPlaces(input%1 * 12, 0) + "\"";
      }
    },
    "ignoredKeywords" : ["meters?", "cms?", "centimeters?",

                         "size"]
  },
  {
    "imperialUnits" : [/-in/, /-?inch/, /inches/],
    "weakImperialUnits" : [/["]/, /''/],
    "standardInputUnit" : " inches",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyValidInput" : isHyperbole,
    "conversionFunction" : (i) => distanceMap(i * 2.54 / 100),
    "ignoredKeywords" : ["cms?", "mms?", "millimeters?", "centimeters?",

                        "monitor", "monitors", "screen", "tv", "tvs",
                        "ipad", "iphone", "phone", "tablet", "tablets",
                        "apple", "windows", "linux", "android", "ios",
                        "macbook", "laptop", "laptops", "computer", "computers", "notebook", "imac", "pc", "dell", "thinkpad", "lenovo",
                        "rgb", "hz"]
  },
  {
    "imperialUnits" : "-?lbs?",
    "weakImperialUnits" : [/-?pound/, /-?pounds/],
    "standardInputUnit" : " lb",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyValidInput" : isHyperbole,
    "conversionFunction" : (i) => createMap(i * 0.453592, " kg"),
    "ignoredKeywords" : ["kgs?", "grams?", "kilograms?",

                         "football", "soccer", "fifa"]
  },
  {
    "imperialUnits" : [/-?mi/, /-?miles?/],
    "standardInputUnit" : " miles",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyValidInput" : (i) => isHyperbole(i) || i === 8,
    "conversionFunction" : (i) => distanceMap(i * 1.609344 * 1000),
    "ignoredKeywords" : ["kms?", "kilometers?",

                         "churn", "credit card", "visa", "mastercard", "awardtravel",
                         "air miles", "aeroplan", "points",
                         "britain", "british", "england", "scotland", "wales", "uk",
                         "italy", "italian", "croatia", "brasil", "brazil"]
  },
  {
    "imperialUnits" : [/(?:°|-?degrees?) ?(?:f|fahrenheit)/, /-?fahrenheit/],
    "weakImperialUnits" : ["f", "-?degrees?"],
    "standardInputUnit" : "°F",
    "isInvalidInput" : (i) => false,
    "isWeaklyValidInput" : (i) => i > 1000,
    "conversionFunction" : (i) => {
      let temperatureMap = createMap((i - 32) * 5/9, "°C");
      if (i > 0 && i < 32) {
        return [temperatureMap, createMap(i * 5/9, " change in °C")];
      } else {
        return temperatureMap;
      }
    },
    "ignoredKeywords" : [/\d*°C/, "degrees? c", "celsius", "kelvin"]
  }
];

const unitLookupMap = unitLookupList.reduce((memo, map) => {
  memo[map['standardInputUnit']] = map;
  return memo;
}, {});

function createMap(value, unit) {
  return {
    "number" : value.toString(),
    "unit" : unit
  };
}

function isZeroOrNegative(i) {
  return i <= 0;
}

function isHyperbole(i) {
  return i.toString().match(/^100+(?:\.0+)?$/) !== null;
}

function roundToDecimalPlaces(number, places) {
  const multiplier = Math.pow(10, places);
  return (Math.round(number * multiplier)/multiplier).toFixed(places);
}

const globalIgnore = ["kill", "suicide", "death", "die", "depression", "crisis", "emergency", "therapy", "therapist", "murder", "rip", "rest in peace", "fatal",

                      "america", "usa", "united states",

                      "dick", "penis", "dong", "cock", "member", "phallus", "wood", "willy", "pecker", "manhood", "boner", "junk", "wiener", "shaft", "dildo",
                      "genitalia", "clit", "labia", "pussy", "vagina", "snatch",
                      "ass", "anus", "anal", "butt", "tit", "kink", "bdsm", "blow job", "jizz", "cum",
                      "nsfw", "gonewild", "sex", "glory hole", "cuck", "porn", "incest", "piv", "milf"]

function shouldConvertComment(comment, regexArray = globalIgnore) {
  const input = comment['body'];
  const postTitle = comment['postTitle'];
  const subreddit = comment['subreddit'];

  const ignoredWordRegex = new RegExp(rh.startRegex
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
      { "imperial": { "number" : 1, "unit" : " miles" } },
      { "imperial": { "number" : 2, "unit" : " miles" } },
      { "imperial": { "number" : 3, "unit" : " mph" } }
    ]
*/
function findPotentialConversions(comment) {
  function findMatchForUnitsAndRemoveFromString(unitArray, standardUnit, string) {
    let potentialConversions = [];
    const unitRegex = rh.regexJoinToString(unitArray);

    const rangeRegex = new RegExp(rh.startRegex 
                         + rh.rangeRegex 
                         + "(?= ?" 
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
          .map(range => range.replace(/to/gi, "-").replace(/[^\d.-]/g, ''))
          .forEach(range => {
            const match = range.match(/\d-(?=-?\d)/);
            if (match) {
              const toIndex = match.index + 1;

              const in1 = range.substring(0, toIndex).replace(/[^\d-\.]/g, '');
              const in2 = range.substring(toIndex + 1).replace(/[^\d-\.]/g, '');

              potentialConversions.push({
                "imperial": {
                  "number" : in1, 
                  "unit" : standardUnit
                }
              });
              potentialConversions.push({
                "imperial": {
                  "number" : in2, 
                  "unit" : standardUnit
                }
              });
            } else {
              analytics.trackError([range, input, subreddit, postTitle])
            }
          });
    }

    const regex = new RegExp(rh.startRegex
                    + rh.numberRegex 
                    + "(?= ?" 
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
              "number" : match, 
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

  let input = comment['body'];

  let processedInput = unitLookupList.reduce((memo, map) => {
    if (map["preprocess"]) {
      return map["preprocess"](input);
    } else {
      return memo;
    }
  }, input)

  return unitLookupList.reduce((memo, map) => {
    if (!shouldConvertComment(comment, map['ignoredKeywords'])) {
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
  }, []);
}

/*
  Input: Array of input numbers and standardized units
    [
      { "imperial": { "number" : 10000, "unit" : " miles" } },
      { "imperial": { "number" : -2, "unit" : " miles" } },
      { "imperial": { "number" : 3, "unit" : " mph" } }
    ]
  Output: Valid conversions
    [
      { "imperial": { "number" : 10000, "unit" : " miles" } },
      { "imperial": { "number" : 3, "unit" : " mph" } }
    ]
*/
function filterConversions(potentialConversions) {
  const possiblyValidConversions = potentialConversions.filter(input => {
    const imperialUnit = input['imperial']['unit'];
    const imperialNumber = Number(input['imperial']['number']);

    const map = unitLookupMap[imperialUnit];
    if (map['isInvalidInput']) {
      return map['isInvalidInput'](imperialNumber) == false;

    } else {
      return true;
    }
  });

  const stronglyValidInput = possiblyValidConversions.filter(input => {
    const imperialUnit = input['imperial']['unit'];
    const imperialNumber = Number(input['imperial']['number']);

    const map = unitLookupMap[imperialUnit];
    if (map['isWeaklyValidInput']) {
      return map['isWeaklyValidInput'](imperialNumber) == false;

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
      { "imperial" : { "number" : 10000, "unit" : " miles" } },
      { "imperial" : { "number" : 30, "unit" : " mpg" } }
    ]
  Output: metric and imperial conversions
    [
      { 
        "imperial" : 
          { "number" : 10000, "unit" : " miles" }, 
        "metric": 
          { "number" : 16093.44, "unit" : " km" } 
      },
      { 
        "imperial" : 
          { "number" : 30, "unit" : " mpg" }, 
        "metric" : [
          { "number" : 12.7543, "unit" : " km/L" },
          { "number" : 7.84049, "unit" : " L/100km" } 
        ]
      }
    ]
*/
function calculateMetric(imperialInputs) {
  return imperialInputs.map(input => {
    const imperialUnit = input['imperial']['unit'];
    const imperialNumber = Number(input['imperial']['number']);

    const map = unitLookupMap[imperialUnit];
    input['metric'] =  map['conversionFunction'](imperialNumber)
    return input;
  });
}

/*
  Input: metric and imperial conversions
    [
      { 
        "imperial" : 
          { "number" : 10000, "unit" : " miles" }, 
        "metric": 
          { "number" : 16093.44, "unit" : " km" } 
      },
      { 
        "imperial" : 
          { "number" : 30, "unit" : " mpg" }, 
        "metric" : [
          { "number" : 12.7543, "unit" : " km/L" },
          { "number" : 7.84049, "unit" : " L/100km" } 
        ]
      }
    ]
  Output: rounded metric and imperial conversions
    [
      { 
        "imperial" : 
          { "number" : 10000, "unit" : " miles" }, 
        "metric": 
          { "number" : 16093.44, "unit" : " km" },
        "rounded" :
          { "number" : 16000.44, "unit" : " km" }
      },
      { 
        "imperial" : 
          { "number" : 30, "unit" : " mpg" }, 
        "metric" : [
          { "number" : 12.7543, "unit" : " km/L" },
          { "number" : 7.84049, "unit" : " L/100km" } 
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
      if (imperial.toString().indexOf('.') !== -1) {
        const decimals = imperial.split('.')[1].length;
        rounded = roundToDecimalPlaces(metric, decimals);

      } else if ((imperial > 100 || metric > 100) && imperial.toString()[imperial.length - 1] == '0') {
        rounded = round(metric, 5);
      } else {
        rounded = round(metric, 3);
      }
      return createMap(rounded, unit);
    }

    const metricConversions = conversion['metric'];
    const imperial = conversion['imperial']['number'];
    let map;
    if (Array.isArray(metricConversions)) {
      map = metricConversions.map(mc => {
        return createMetricMap(imperial, mc['number'], mc['unit'])
      });
    } else {
      map = createMetricMap(imperial, conversion['metric']['number'], conversion['metric']['unit'])
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
        return createMap(rh.addCommas(rc['number']), rc['unit']);
      });
    } else {
      const metric = conversion['rounded']['number'];
      conversion['formatted'] = createMap(rh.addCommas(metric), conversion['rounded']['unit'])
    }

    const imperialUnit = conversion['imperial']['unit'];
    const imperialNumber = conversion['imperial']['number'];

    const postprocessInput = unitLookupMap[imperialUnit]['postprocessInput'];
    if (postprocessInput) {
      conversion['imperial']['number'] = postprocessInput(imperialNumber);
      conversion['imperial']['unit'] = "";
    } else {
      conversion['imperial']['number'] = rh.addCommas(imperialNumber);
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
