const rh = require('./regex_helper');

function distanceMap(m) {
  if (m < 0.01) {
    return createMap(m * 1000, " mm");

  } else if (m < 1) {
    return createMap(m * 100, " cm");

  } else if (m > 94607304725808) {
    return createMap(m/9460730472580800, " light-years")

  } else if (m >= 1000) {
    return createMap(m/1000, " km");
    
  } else {
    return createMap(m, " metres");
  }
}

function weightMap(g) {
  const kg = g/1000;
  if (g < 1000) {
    return createMap(g, " g");

  } else if (kg < 1000) {
    return createMap(kg, " kg");

  } else {
    return createMap(kg/1000, " metric tons")
  }
}

function volumeMap(l) {
  if (l < 1) {
    return createMap(l*1000, " mL");

  } else if (l > 1000000000000) {
    return createMap(l / 1000000000000, " km^3");

  } else if (l > 1000) {
    return createMap(l / 1000, " m^3");

  } else {
    return createMap(l, " L");
  }
}

function areaMap(m2) {
  if (m2 >= 1000000) {
    return createMap(m2 / 1000000, " km^2");

  } else if (m2 >= 10000) {
    return createMap(m2 / 10000, " hectares");

  } else {
    return createMap(m2, " m^2");
  }
}

const metricDistanceUnits = [/\bkm\b/, /light-?years?/,
                             /(?:milli|centi|deca|kilo)?met(?:re|er)s?/];
const metricWeightUnits = [/kgs?/, /grams?/, /kilograms?/];
const metricVolumeUnits = [/(?:milli|centi|deca|kilo)?lit(?:er|re)s?/, /(?:deca|kilo)?m\^3/];
const metricForceUnits = [/newtons?/, /dynes?/];

const ukSubreddits = ["britain", "british", "england", "english", "scotland", "scottish", "wales", "welsh", "ireland", "irish", "london", "uk"];

/*
  Units at the start of the list will take precenence over units later (so "miles per hour" takes precedence over "miles")

  Here is a description of what each key in the objects means:

  imperialUnits - A list of regular expressions (or strings that will be passed into new RegExp()) that are used to find the imperial units we want to replace.

  weakImperialUnits (optional) - A list of sometimes-used units (i.e. "in" for inch), that should only be converted if a different unit of the same kind (i.e. "inch") has been used in the post

  standardInputUnit - The unit string that will be displayed to the user at the end of the conversion

  isInvalidInput - These inputs should definitely not be converted (i.e. a negative distance)

  isWeaklyInvalidInput - These input should probably not be converted (i.e. 8 Mile, the movie, or 1000000 miles, a hyperbole)

  conversionFunction - A function that gets passed in a number, and returns the metric conversion in the form
    {
      number: metric-number,
      unit: metric-unit
    }

  ignoredUnits (optional) - If the OP has already converted the units, regardless of case sensitivity, we don't want to duplicate their efforts! 

  ignoredKeywords (optional) - Sometimes people yell at us for converting football yards to metric. So here is where we throw keywords that we don't want to convert

  preprocess (optional) - A function that runs before any conversions are done that changes the input string into a more easily parsed format (i.e. 6'6" to 6.5 feet)

  postprocess (optional) - A function that runs after all conversions have been done that takes the imperial input (6.5 feet) and converts it to a better format (6'6")
*/
const unitLookupList = [
  {
    "imperialUnits" : [/mpg/, /miles per gal(?:lon)?/],
    "standardInputUnit" : " mpg (US)",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
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
    "ignoredUnits" : ["L/100km", "km/L"],
    "ignoredKeywords" : ["basketball", "hockey", "soccer", "football", "rugby", "lacrosse", "cricket", "volleyball", "polo",
                         "nba", "nhl", "nfl", "sport",
                         "play", "game"].concat(ukSubreddits)
  },
  {
    "imperialUnits" : [/mph/, /miles (?:an|per) hour/],
    "standardInputUnit" : " mph",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : (i) => isHyperbole(i) || [60, 88].indexOf(i) !== -1,
    "conversionFunction" : (i) => {
      const km = i * 1.609344;
      if (i < 200) {
        return createMap(km, " km/h");
        
      } else if (i >= 6706166) {
        return createMap(i/670616629.3844, "c");

      } else {
        let perSMap = distanceMap(km * 1000 / 60 / 60);
        perSMap['unit'] += "/s";

        return [createMap(km, " km/h"), perSMap];
      }
    },
    "ignoredUnits" : ["km/hr?", "kmh", "kph", "kilometers? ?(?:per|an|/) ?hour", "m/s"],
    "ignoredKeywords" : ukSubreddits
  },
  {
    "imperialUnits" : [/mi/, /miles?/],
    "standardInputUnit" : " miles",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : (i) => isHyperbole(i) || i === 8,
    "conversionFunction" : (i) => distanceMap(i * 1609.344),
    "ignoredUnits" : metricDistanceUnits,
    "ignoredKeywords" : ["churn", "credit card", "visa", "mastercard", "awardtravel",
                         "air miles", "aeroplan", "points",
                         "italy", "italian", "croatia", "brasil", "brazil", "turkey", "mexico"].concat(ukSubreddits)
  },
  {
    "imperialUnits" : [/psi/, /pounds?[ -]?(?:force)?[- ]?(?:per|an?[/])[- ]?squared? inch/],
    "standardInputUnit" : " psi",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => createMap(i * 6.89476, " kPa"),
    "ignoredUnits" : [/pascals?/, /pa/]
  },
  {
    "imperialUnits" : [/(?:foot|ft)[ -·]?(?:pounds?|lbf?|lbs?)/, /(?:pounds?|lbs?)[ -·]?(?:foot|fts?)/],
    "standardInputUnit" : " ft·lbf",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : (i) => isHyperbole(i) || i === 8,
    "conversionFunction" : (i) => createMap(i * 1.355818, " Nm"),
    "ignoredUnits" : [/newton[ -]?met(?:er|re)s?/, /Nm/, /joule/]
  },
  {
    "imperialUnits" : [/feet/, /ft/, /foot/],
    "weakImperialUnits" : [/[']/],
    "standardInputUnit" : " feet",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : (i) => isHyperbole(i) || [1, 2, 4, 6].indexOf(i) !== -1,
    "conversionFunction" : (i) => distanceMap(i * 0.3048),
    "ignoredUnits" : metricDistanceUnits,
    "ignoredKeywords" : ["size", "pole"],
    "preprocess" : (input) => {
      const feetAndInchesRegex = 
        new RegExp(( rh.startRegex 
          + rh.numberRegex
          + "[- ]?"
          + rh.regexJoinToString(["[\']", "ft", /feet/, /foot/])
          + "[- ]?"
          + rh.numberRegex
          + "[- ]?"
          + rh.regexJoinToString([/["]/, /in/, /inch/, /inches/])
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
  },
  {
    "imperialUnits" : [/yards?/],
    "standardInputUnit" : " yards",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => distanceMap(i * 0.9144),
    "ignoredUnits" : metricDistanceUnits,
    "ignoredKeywords" : ["football", "golf", "(?:touch)?down", "cfl", "nfl", "wow"]
  },
  {
    "imperialUnits" : [/inch/, /inches/],
    "weakImperialUnits" : [/["]/, /''/, /in/],
    "standardInputUnit" : " inches",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => distanceMap(i * 0.0254),
    "ignoredUnits" : metricDistanceUnits,
    "ignoredKeywords" : ["monitor", "monitors", "screen", "tv", "tvs",
                        "ipad", "iphone", "phone", "tablet", "tablets",
                        "apple", "windows", "linux", "android", "ios",
                        "macbook", "laptop", "laptops", "computer", "computers", "notebook", "imac", "pc", "dell", "thinkpad", "lenovo",
                        "rgb", "hz"]
  },
  {
    "imperialUnits" : [/furlongs?/],
    "weakImperialUnits" : [/fur/],
    "standardInputUnit" : " furlongs",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => distanceMap(i * 201.168),
    "ignoredUnits" : metricDistanceUnits
  },
  {
    "imperialUnits" : [/pounds?[ -]?(?:force)/, /lbf/, /lbs?[ -]?(?:force)/],
    "standardInputUnit" : " lbf",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => createMap(i * 4.44822, " N"),
    "ignoredUnits" : metricForceUnits
  },
  {
    "imperialUnits" : "lbs?",
    "weakImperialUnits" : [/pounds?/],
    "standardInputUnit" : " lb",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => weightMap(i * 453.592),
    "ignoredUnits" : metricWeightUnits,
    "ignoredKeywords" : ["football", "soccer", "fifa", "bowling"],
    "preprocess" : (input) => {
      const lbAndOz = 
        new RegExp(( rh.startRegex 
          + rh.numberRegex
          + "[- ]?"
          + rh.regexJoinToString([/lbs?/, /pounds?/])
          + "[- ]?"
          + rh.numberRegex
          + "[- ]?"
          + rh.regexJoinToString([/oz/, /ounces?/])
        ),'gi');
      return input.replace(lbAndOz, (match, lb, oz, offset, string) => {
        const ozLessThan16 = Number(oz) <= 16;
        if (ozLessThan16) {
          const lbNumeral = roundToDecimalPlaces(Number(lb.replace(/[^\d-\.]/g, '')) + Number(oz)/16, 2);
          return " " + lbNumeral + " lb ";
        } else {
          return "  ";
        }
      });
    },
    "postprocessInput" : (input) => {
      if (input.toString().indexOf('.') == -1) {
        return rh.addCommas(input) + " lb";
      } else {
        return rh.addCommas(Math.floor(input).toString()) + " lb " 
               + roundToDecimalPlaces(input%1 * 16, 0) + " oz";
      }
    }
  },
  {
    "imperialUnits" : [/(?:liquid|fluid|fl\.?)[ -]?(?:oz|ounces?)/,
                       /(?:oz\.?|ounces?)[ -]?(?:liquid|fluid|fl)/],
    "standardInputUnit" : " fl. oz.",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => volumeMap(i * 0.0295735295625),
    "ignoredUnits" : metricVolumeUnits,
    "ignoredKeywords" : ukSubreddits
  },
  {
    "imperialUnits" : [/oz/, /ounces?/],
    "standardInputUnit" : " oz",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => weightMap(i * 28.3495),
    "ignoredUnits" : metricWeightUnits,
    "ignoredKeywords" : ["leather"].concat(ukSubreddits)
  },
  {
    "imperialUnits" : [/teaspoons?/, /tsp/],
    "standardInputUnit" : " tsp",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => volumeMap(i * 0.00492892),
    "ignoredUnits" : metricVolumeUnits
  },
  {
    "imperialUnits" : [/tablespoons?/, /tbsp/, /tbl/],
    "standardInputUnit" : " Tbsp",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => volumeMap(i * 0.0147868),
    "ignoredUnits" : metricVolumeUnits
  },
  {
    "imperialUnits" : [/cups?/],
    "standardInputUnit" : " cups (US)",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => volumeMap(i * 0.24),
    "ignoredUnits" : metricVolumeUnits,
    "ignoredKeywords" : ["bra", "band", "sizes?"]
  },
  {
    "imperialUnits" : [/pints?/],
    "standardInputUnit" : " pints",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => volumeMap(i * 0.473176),
    "ignoredUnits" : metricVolumeUnits,
    "ignoredKeywords" : ukSubreddits
  },
  {
    "imperialUnits" : [/quarts?/],
    "standardInputUnit" : " quarts",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => volumeMap(i * 0.946353),
    "ignoredUnits" : metricVolumeUnits
  },
  {
    "imperialUnits" : [/\(?(?:uk|imp(?:erial)?)\)? gal(?:lons?)?/, 
                       /gal(?:lons?)? \(?(?:uk|imp(?:erial)?\)?)/],
    "standardInputUnit" : " gal (imp)",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => volumeMap(i * 4.54609),
    "ignoredUnits" : metricVolumeUnits
  },
  {
    "imperialUnits" : [/gal(?:lons?)?/],
    "standardInputUnit" : " gal (US)",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => volumeMap(i * 3.78541),
    "ignoredUnits" : ["imperial"].concat(metricVolumeUnits),
    "ignoredKeywords" : ukSubreddits
  },
  {
    "imperialUnits" : [/pecks?/, /pks?/],
    "standardInputUnit" : " pk (US)",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => volumeMap(i * 8.80977),
    "ignoredUnits" : ["imperial"].concat(metricVolumeUnits),
    "ignoredKeywords" : ukSubreddits
  },
  {
    "imperialUnits" : [/(?:°|degrees?) ?(?:f|fahrenheit)/, /fahrenheit/],
    "weakImperialUnits" : ["f", "degrees?"],
    "standardInputUnit" : "°F",
    "isInvalidInput" : (i) => false,
    "isWeaklyInvalidInput" : (i) => i > 1000,
    "conversionFunction" : (i) => {
      let temperatureMap = createMap((i - 32) * 5/9, "°C");
      if (i > 0 && i < 32) {
        return [temperatureMap, createMap(i * 5/9, " change in °C")];
      } else {
        return temperatureMap;
      }
    },
    "ignoredUnits" : [/° ?C/, "degrees? c", "celsius", "kelvin"]
  },
  {
    "imperialUnits" : [/acres?/],
    "standardInputUnit" : " acres",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => areaMap(i * 4046.8564),
    "ignoredUnits" : [
      /square kilometers?/,
      /sq.? km/,
      /sq.? kilometers?/,
      /km[^]2/
    ]
  },
  {
    "imperialUnits" : [/bushels?/],
    "standardInputUnit" : " bushels",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => weightMap(i * 35239.07040000007),
    "ignoredUnits" : metricWeightUnits
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
  const isOneFollowedByZeros = i.toString().match(/^100+(?:\.0+)?$/) !== null;
  const isOneFollowedByExponentTerm = i.toString().match(/1e(?:\d)*/) !== null;
  return isOneFollowedByZeros || isOneFollowedByExponentTerm;
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
      return map["preprocess"](memo);
    } else {
      return memo;
    }
  }, input)

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
    const number = item['imperial']['number'];
    if (duplicateCache[unit] === undefined) {
      duplicateCache[unit] = [number];
      return true;
    } else if (duplicateCache[unit].indexOf(number) === -1) {
      duplicateCache[unit].push(number);
      return true;
    } else {
      return false;
    }
  });
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
    if (map['isWeaklyInvalidInput']) {
      return map['isWeaklyInvalidInput'](imperialNumber) == false;

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
          { "number" : 16000, "unit" : " km" }
      },
      { 
        "imperial" : 
          { "number" : 30, "unit" : " mpg" }, 
        "metric" : [
          { "number" : 12.7543, "unit" : " km/L" },
          { "number" : 7.84049, "unit" : " L/100km" } 
        ],
        "rounded" : [
          { "number" : 12.8, "unit" : " km/L" },
          { "number" : 7.8, "unit" : " L/100km" } 
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
