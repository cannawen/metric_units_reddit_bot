const rh = require('./regex_helper');
const fsh = require('./file_system_helper');

function volumeMap(l) {
  const unitDecider = Math.max(...l);
  if (unitDecider < 1) {
    return createMap(l.map((i) => i * 1000), " mL");

  } else if (unitDecider > 1000000000000) {
    return createMap(l.map((i) => i / 1000000000000), " km^3");

  } else if (unitDecider > 1000) {
    return createMap(l.map((i) => i / 1000), " m^3");

  } else {
    return createMap(l, " L");
  }
}

function areaMap(m2) {
  const unitDecider = Math.max(...m2);
  if (unitDecider >= 1000000) {
    return createMap(m2.map((i) => i / 1000000), " km^2");

  } else if (unitDecider >= 10000) {
    return createMap(m2.map((i) => i / 10000), " hectares");

  } else {
    return createMap(m2, " m^2");
  }
}

function pressureMap(pa) {
  const unitDecider = Math.max(...pa);
  if (unitDecider < 1000) {
    return createMap(pa, " Pa");

  } else {
    const kPa = pa.map((i) => i / 1000);

    return createMap(kPa, " kPa");
  }
}

function velocityMap(mPerS) {
  function distanceMap(m) {
    const unitDecider = Math.max(...m);
    if (unitDecider < 0.01) {
      return createMap(m.map((i) => i * 1000), " mm");

    } else if (unitDecider < 1) {
      return createMap(m.map((i) => i * 100), " cm");

    } else if (unitDecider > 94607304725808) {
      return createMap(m.map((i) => i/9460730472580800), " light-years");


    } else if (unitDecider >= 3218688000) {
      return createMap(m.map((i) => i/299792458), " light-seconds");

    } else if (unitDecider >= 1000) {
      return createMap(m.map((i) => i/1000), " km");

    } else {
      return createMap(m, " metres");
    }
  }

  const unitDecider = Math.max(...mPerS);
  if (unitDecider < 89.408) {
    return createMap(mPerS.map((i) => i * 3.6), " km/h");

  } else if (unitDecider >= 2997924.58) {
    return createMap(mPerS.map((i) => i / 299792458), "c");

  } else {
    let perSMap = distanceMap(mPerS, ((i) => i));
    perSMap['unit'] += "/s";

    return [createMap(mPerS.map((i) => i * 3.6), " km/h"), perSMap];
  }
}

const metricVolumeUnits = [/(?:milli|centi|deca|kilo)?lit(?:er|re)s?/, /(?:deca|kilo)?m(?:eters?)?(?:\^3| cubed?)/];
const metricForceUnits = [/newtons?/, /dynes?/];
const liquidKeywords = ['liquids?', 'water', 'teas?', 'beers?', 'sodas?', 'pops?', 'colas?', 'ciders?', 'juices?', 'coffees?', 'liquors?', 'milk', 'bottles?', 'spirits?', 'rums?', 'vodkas?', 'tequilas?', 'wines?', 'oils?', "cups?", "cans?", "tall boys?", "brews?", "breastfeeding", "breastfee?d", "pints?", "bartends?", "bartending", "flow", "paint", "retarder", "thinner", "primer", "wash", "acrylic", "paste"];

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
    "imperialUnits" : [/mpg/, /miles per gal(?:lon)?/],
    "standardInputUnit" : " mpg (US)",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => {
      return [
        createMap(i.map((j) => j * 0.425144), " km/L"),
        createMap(i.map((j) => 235.215 / j), " L/100km")
      ]
    },
    "ignoredUnits" : ["L/100km", "km/L"],
    "ignoredKeywords" : ["basketball", "hockey", "soccer", "football", "rugby", "lacrosse", "cricket", "volleyball", "polo",
                         "nba", "nhl", "nfl", "sport",
                         "play", "game",
                         "mavericks", "denvernuggets", "warriors", "rockets", "laclippers", "lakers", "memphisgrizzlies", 
                         "timberwolves", "nolapelicans", "thunders", "suns", "ripcity", "kings", "nbaspurs", "utahjazz", 
                         "atlantahawks", "bostonceltics", "gonets", "charlottehornets", "chicagobulls", "clevelandcavs", 
                         "detroitpistons", "pacers", "heat", "mkebucks", "nyknicks", "orlandomagic", "sixers", 
                         "torontoraptors", "washingtonwizards"].concat(ukSubreddits)
  },
  {
    "imperialUnits" : [/mph/, /miles (?:an|per) hour/],
    "standardInputUnit" : " mph",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : (i) => isHyperbole(i) || [60, 88].indexOf(i) !== -1,
    "conversionFunction" : (i) => velocityMap(i.map((j) => j * 0.44704)), // 1 mph = 0.44704 m/s
    "ignoredUnits" : ["km/hr?", "kmh", "kph", "kilometers? ?(?:per|an|/) ?hour", "m/s"],
    "ignoredKeywords" : ukSubreddits
  },
  {
    "imperialUnits" : [/f(?:oo|ee)?t (?:\/|per) s(?:ec(?:ond)?)?/],
    "standardInputUnit" : " ft/sec",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => velocityMap(i.map((j) => j * 0.3048)) // 1 ft/s = 0.3048 m/s
  },
  {
    "imperialUnits" : [/(?:pounds?|lbs?)\/(?:inch|in)/] ,
    "standardInputUnit" : " lbs/inch",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => {return [createMap(i.map((j) => j * 0.017858), " kg/mm"), createMap(i.map((j) => j * 175.126835), " N/m")]},  // 1 lbs/inch = 0.017858 kg/mm
    "ignoredUnits" : [/newton[ -]?met(?:er|re)s?/, /Nm/, /kg\/mm/]
  },
  {
    "imperialUnits" : [/psi/, /pounds?[ -]?(?:force)?[- ]?(?:per|an?[/])[- ]?squared? inch/],
    "standardInputUnit" : " psi",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => pressureMap(i.map((j) => j * 6894.76)),
    "ignoredUnits" : [/pascals?/],
    "ignoredKeywords" : ["homebrewing"]
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
    "imperialUnits" : [/(?:liquid|fluid|fl\.?)[ -]?(?:oz|ounces?)/,
                       /(?:oz\.?|ounces?)[ -]?(?:liquid|fluid|fl)/],
    "standardInputUnit" : " fl. oz.",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => volumeMap(i.map((j) => j * 0.0295735295625)),
    "ignoredUnits" : metricVolumeUnits,
    "ignoredKeywords" : ukSubreddits,
    "preprocess" : (comment) => {
      const input = comment['body'];
      const ozRegex = new RegExp(( rh.startRegex 
          + rh.numberRegex
          + "[- ]?"
          + rh.regexJoinToString([/oz/, /ounces?/])
        ),'gi');
      const ozAndLiquidRegex = new RegExp(( ozRegex.source
          + ".+?\\b"
          + rh.regexJoinToString(liquidKeywords)
        ),'i');

      if (!ozAndLiquidRegex.test(input)) {
        return input;
      }

      return input.replace(ozRegex, (oz, offset, string) => {
        return " " + oz + " fl. oz";
      });
    }
  },
  {
    "imperialUnits" : [/teaspoons?/, /tsp/],
    "standardInputUnit" : " tsp",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => volumeMap(i.map((j) => j * 0.00492892)),
    "ignoredUnits" : metricVolumeUnits
  },
  {
    "imperialUnits" : [/tablespoons?/, /tbsp/, /tbl/],
    "standardInputUnit" : " Tbsp",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => volumeMap(i.map((j) => j * 0.0147868)),
    "ignoredUnits" : metricVolumeUnits
  },
  {
    "imperialUnits" : [/cups?/],
    "standardInputUnit" : " cups (US)",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : (i) => isHyperbole(i) || i > 100,
    "conversionFunction" : (i) => volumeMap(i.map((j) => j * 0.24)),
    "ignoredUnits" : metricVolumeUnits,
    "ignoredKeywords" : ["bra", "band", "sizes?", "clio", "clashofclans", "coc", "clashroyale"]
  },
  {
    "imperialUnits" : [/pints?/],
    "standardInputUnit" : " pints",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => volumeMap(i.map((j) => j * 0.473176)),
    "ignoredUnits" : metricVolumeUnits,
    "ignoredKeywords" : ukSubreddits
  },
  {
    "imperialUnits" : [/quarts?/],
    "standardInputUnit" : " quarts",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => volumeMap(i.map((j) => j * 0.946353)),
    "ignoredUnits" : metricVolumeUnits
  },
  {
    "imperialUnits" : [/\(?(?:uk|imp(?:erial)?)\)? gal(?:lons?)?/, 
                       /gal(?:lons?)? \(?(?:uk|imp(?:erial)?\)?)/],
    "standardInputUnit" : " gal (imp)",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => volumeMap(i.map((j) => j * 4.54609)),
    "ignoredUnits" : metricVolumeUnits
  },
  {
    "imperialUnits" : [/gal(?:lons?)?/],
    "standardInputUnit" : " gal (US)",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => volumeMap(i.map((j) => j * 3.78541)),
    "ignoredUnits" : ["imperial"].concat(metricVolumeUnits),
    "ignoredKeywords" : ukSubreddits
  },
  {
    "imperialUnits" : [/pecks?/],
    "standardInputUnit" : " pecks (US)",
    "isInvalidInput" : isZeroOrNegative,
    "isWeaklyInvalidInput" : isHyperbole,
    "conversionFunction" : (i) => volumeMap(i.map((j) => j * 8.80977)),
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
      const temperatureMap = createMap(i.map((j) => (j - 32) * 5/9), "°C");
      const unitDecider = Math.max(...i);
      if (unitDecider > 0 && unitDecider < 32) {
        return [temperatureMap, createMap(i.map((j) => j * 5/9), " change in °C")];
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
    "conversionFunction" : (i) => areaMap(i.map((j) => j * 4046.8564)),
    "ignoredUnits" : [
      /square kilometers?/,
      /sq.? km/,
      /sq.? kilometers?/,
      /km[^]2/
    ]
  }
];

const units = fsh.getAllPaths(__dirname + '/conversion').map(require);
unitLookupList = unitLookupList.concat(units);

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
