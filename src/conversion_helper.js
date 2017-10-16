const rh = require('./regex_helper');

function createMap(value, unit) {
  return {
    numbers: value.map(i => i.toString()),
    unit,
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
  return (Math.round(number * multiplier) / multiplier).toFixed(places);
}

function distanceMap(m) {
  const unitDecider = Math.max(...m);
  if (unitDecider < 0.01) {
    return createMap(m.map(i => i * 1000), ' mm');
  } else if (unitDecider < 1) {
    return createMap(m.map(i => i * 100), ' cm');
  } else if (unitDecider > 94607304725808) {
    return createMap(m.map(i => i / 9460730472580800), ' light-years');
  } else if (unitDecider >= 3218688000) {
    return createMap(m.map(i => i / 299792458), ' light-seconds');
  } else if (unitDecider >= 1000) {
    return createMap(m.map(i => i / 1000), ' km');
  }
  return createMap(m, ' metres');
}

function weightMap(g) {
  const kg = g.map(i => i / 1000);
  const unitDecider = Math.max(...g);
  const unitDeciderKg = unitDecider / 1000;
  if (unitDecider < 1000) {
    return createMap(g, ' g');
  } else if (unitDeciderKg < 1000) {
    return createMap(kg, ' kg');
  }
  return createMap(kg.map(i => i / 1000), ' metric tons');
}

function volumeMap(l) {
  const unitDecider = Math.max(...l);
  if (unitDecider < 1) {
    return createMap(l.map(i => i * 1000), ' mL');
  } else if (unitDecider > 1000000000000) {
    return createMap(l.map(i => i / 1000000000000), ' km^3');
  } else if (unitDecider > 1000) {
    return createMap(l.map(i => i / 1000), ' m^3');
  }
  return createMap(l, ' L');
}

function areaMap(m2) {
  const unitDecider = Math.max(...m2);
  if (unitDecider >= 1000000) {
    return createMap(m2.map(i => i / 1000000), ' km^2');
  } else if (unitDecider >= 10000) {
    return createMap(m2.map(i => i / 10000), ' hectares');
  }
  return createMap(m2, ' m^2');
}

function pressureMap(pa) {
  const unitDecider = Math.max(...pa);
  if (unitDecider < 1000) {
    return createMap(pa, ' Pa');
  }
  const kPa = pa.map(i => i / 1000);

  return createMap(kPa, ' kPa');
}

function velocityMap(mPerS) {
  const unitDecider = Math.max(...mPerS);
  if (unitDecider < 89.408) {
    return createMap(mPerS.map(i => i * 3.6), ' km/h');
  } else if (unitDecider >= 2997924.58) {
    return createMap(mPerS.map(i => i / 299792458), 'c');
  }
  const perSMap = distanceMap(mPerS, (i => i));
  perSMap.unit += '/s';

  return [createMap(mPerS.map(i => i * 3.6), ' km/h'), perSMap];
}

const metricDistanceUnits = [/km/, /light-?years?/,
  /(?:milli|centi|deca|kilo)?met(?:re|er)s?/];
const metricWeightUnits = [/kgs?/, /grams?/, /kilograms?/];
const metricVolumeUnits = [/(?:milli|centi|deca|kilo)?lit(?:er|re)s?/, /(?:deca|kilo)?m(?:eters?)?(?:\^3| cubed?)/];
const metricForceUnits = [/newtons?/, /dynes?/];
const liquidKeywords = ['liquids?', 'water', 'teas?', 'beers?', 'sodas?', 'pops?', 'colas?', 'ciders?', 'juices?', 'coffees?', 'liquors?', 'milk', 'bottles?', 'spirits?', 'rums?', 'vodkas?', 'tequilas?', 'wines?', 'oils?', 'cups?', 'cans?', 'tall boys?', 'brews?', 'breastfeeding', 'breastfee?d', 'pints?', 'bartends?', 'bartending', 'flow', 'paint', 'retarder', 'thinner', 'primer', 'wash', 'acrylic', 'paste'];

const ukSubreddits = ['britain', 'british', 'england', 'english', 'scotland', 'scottish', 'wales', 'welsh', 'ireland', 'irish', 'london', 'uk'];

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
const unitLookupList = [
  {
    imperialUnits: [/mpg/, /miles per gal(?:lon)?/],
    standardInputUnit: ' mpg (US)',
    isInvalidInput: isZeroOrNegative,
    isWeaklyInvalidInput: isHyperbole,
    conversionFunction: (i) => [
      createMap(i.map((j) => j * 0.425144), ' km/L'),
      createMap(i.map((j) => 235.215 / j), ' L/100km'),
    ],
    ignoredUnits: ['L/100km', 'km/L'],
    ignoredKeywords: ['basketball', 'hockey', 'soccer', 'football', 'rugby', 'lacrosse', 'cricket', 'volleyball', 'polo',
      'nba', 'nhl', 'nfl', 'sport',
      'play', 'game',
      'mavericks', 'denvernuggets', 'warriors', 'rockets', 'laclippers', 'lakers', 'memphisgrizzlies',
      'timberwolves', 'nolapelicans', 'thunders', 'suns', 'ripcity', 'kings', 'nbaspurs', 'utahjazz',
      'atlantahawks', 'bostonceltics', 'gonets', 'charlottehornets', 'chicagobulls', 'clevelandcavs',
      'detroitpistons', 'pacers', 'heat', 'mkebucks', 'nyknicks', 'orlandomagic', 'sixers',
      'torontoraptors', 'washingtonwizards'].concat(ukSubreddits),
  },
  {
    imperialUnits: [/mph/, /miles (?:an|per) hour/],
    standardInputUnit: ' mph',
    isInvalidInput: isZeroOrNegative,
    isWeaklyInvalidInput: i => isHyperbole(i) || [60, 88].indexOf(i) !== -1,
    conversionFunction: i => velocityMap(i.map(j => j * 0.44704)), // 1 mph = 0.44704 m/s
    ignoredUnits: ['km/hr?', 'kmh', 'kph', 'kilometers? ?(?:per|an|/) ?hour', 'm/s'],
    ignoredKeywords: ukSubreddits,
  },
  {
    imperialUnits: [/f(?:oo|ee)?t (?:\/|per) s(?:ec(?:ond)?)?/],
    standardInputUnit: ' ft/sec',
    isInvalidInput: isZeroOrNegative,
    isWeaklyInvalidInput: isHyperbole,
    conversionFunction: i => velocityMap(i.map(j => j * 0.3048)), // 1 ft/s = 0.3048 m/s
  },
  {
    imperialUnits: [/(?:pounds?|lbs?)\/(?:inch|in)/],
    standardInputUnit: ' lbs/inch',
    isInvalidInput: isZeroOrNegative,
    isWeaklyInvalidInput: isHyperbole,
    conversionFunction: i => [createMap(i.map(j => j * 0.017858), ' kg/mm'), createMap(i.map(j => j * 175.126835), ' N/m')], // 1 lbs/inch = 0.017858 kg/mm
    ignoredUnits: [/newton[ -]?met(?:er|re)s?/, /Nm/, /kg\/mm/],
  },
  {
    imperialUnits: [/mi/, /miles?/],
    standardInputUnit: ' miles',
    isInvalidInput: isZeroOrNegative,
    isWeaklyInvalidInput: i => isHyperbole(i) || i === 8,
    conversionFunction: i => distanceMap(i.map(j => j * 1609.344)),
    ignoredUnits: metricDistanceUnits,
    ignoredKeywords: ['churn', 'credit card', 'visa', 'mastercard', 'awardtravel',
      'air miles', 'aeroplan', 'points',
      'italy', 'italian', 'croatia', 'brasil', 'brazil', 'turkey', 'mexico'].concat(ukSubreddits),
  },
  {
    imperialUnits: [/psi/, /pounds?[ -]?(?:force)?[- ]?(?:per|an?[/])[- ]?squared? inch/],
    standardInputUnit: ' psi',
    isInvalidInput: isZeroOrNegative,
    isWeaklyInvalidInput: isHyperbole,
    conversionFunction: i => pressureMap(i.map(j => j * 6894.76)),
    ignoredUnits: [/pascals?/],
    ignoredKeywords: ['homebrewing'],
  },
  {
    imperialUnits: [/(?:foot|ft)[ -·]?(?:pounds?|lbf?|lbs?)/, /(?:pounds?|lbs?)[ -·]?(?:foot|fts?)/],
    standardInputUnit: ' ft·lbf',
    isInvalidInput: isZeroOrNegative,
    isWeaklyInvalidInput: i => isHyperbole(i) || i === 8,
    conversionFunction: i => createMap(i.map(j => j * 1.355818), ' Nm'),
    ignoredUnits: [/newton[ -]?met(?:er|re)s?/, /Nm/, /joule/],
  },
  {
    imperialUnits: [/feet/, /ft/, /foot/],
    weakImperialUnits: [/[']/],
    standardInputUnit: ' feet',
    isInvalidInput: isZeroOrNegative,
    isWeaklyInvalidInput: i => isHyperbole(i) || [1, 2, 4, 6].indexOf(i) !== -1,
    conversionFunction: i => distanceMap(i.map(j => j * 0.3048)),
    ignoredUnits: metricDistanceUnits,
    ignoredKeywords: ['size', 'pole'],
    preprocess: (comment) => {
      const input = comment.body;
      const feetAndInchesRegex =
        new RegExp(
          (`${rh.startRegex
          + rh.numberRegex
          }[- ]?${
            rh.regexJoinToString(["[\']", 'ft', /feet/, /foot/])
          }[- ]?${
            rh.numberRegex
          }[- ]?${
            rh.regexJoinToString([/["]/, /in/, /inch/, /inches/])}`
          ), 'gi',
        );
      return input.replace(feetAndInchesRegex, (match, feet, inches, offset, string) => {
        const inchesLessThan12 = inches <= 12;
        const inchesLessThan3CharactersBeforeDecimal = inches
          .toString()
          .split('.')[0]
          .replace(/[^\d\.]/, '')
          .length <= 2;
        if (inchesLessThan12 && inchesLessThan3CharactersBeforeDecimal) {
          const feetNumeral = roundToDecimalPlaces(Number(feet.replace(/[^\d-\.]/g, '')) + Number(inches) / 12, 2);
          return ` ${feetNumeral} feet `;
        }
        return '  ';
      });
    },
    postprocessInput: (numbers) => {
      if (numbers.every((input) => input.toString().indexOf('.') == -1)) {
        return numbers.map(function(input, index) {
          if(index == numbers.length-1) {
            return `${rh.addCommas(input)} feet`;
          } else {
            return rh.addCommas(input);
          }
        });
      } else {
        return numbers.map((input) => `${rh.addCommas(Math.floor(input).toString())}'${
          roundToDecimalPlaces(input % 1 * 12, 0)}"`);
      }
    },
  },
  {
    imperialUnits: [/yards?/],
    standardInputUnit: ' yards',
    isInvalidInput: isZeroOrNegative,
    isWeaklyInvalidInput: isHyperbole,
    conversionFunction: i => distanceMap(i.map(j => j * 0.9144)),
    ignoredUnits: metricDistanceUnits,
    ignoredKeywords: ['football', 'golf', '(?:touch)?down', 'cfl', 'nfl', 'wow',
      'denverbroncos', 'kansascitychiefs', 'chargers', 'oaklandraiders',
      'texans', 'colts', 'jaguars', 'tennesseetitans', 'ravens',
      'bengals', 'browns', 'steelers', 'buffalobills', 'miamidolphins',
      'patriots', 'nyjets', 'cowboys', 'nygiants', 'eagles', 'redskins',
      'chibears', 'detroitlions', 'greenbaypackers', 'minnesotavikings',
      'falcons', 'panthers', 'saints', 'buccaneers', 'azcardinals',
      'losangelesrams', '49ers', 'seahawks'],
  },
  {
    imperialUnits: [/inch/, /inches/],
    weakImperialUnits: [/["]/, /''/, /in/],
    standardInputUnit: ' inches',
    isInvalidInput: isZeroOrNegative,
    isWeaklyInvalidInput: isHyperbole,
    conversionFunction: i => distanceMap(i.map(j => j * 0.0254)),
    ignoredUnits: metricDistanceUnits,
    ignoredKeywords: ['monitor', 'monitors', 'screen', 'tv', 'tvs',
      'ipad', 'iphone', 'phone', 'tablet', 'tablets',
      'apple', 'windows', 'linux', 'android', 'ios',
      'macbook', 'laptop', 'laptops', 'computer', 'computers', 'notebook', 'imac', 'pc', 'dell', 'thinkpad', 'lenovo',
      'rgb', 'hz'],
  },
  {
    imperialUnits: [/furlongs?/],
    weakImperialUnits: [/fur/],
    standardInputUnit: ' furlongs',
    isInvalidInput: isZeroOrNegative,
    isWeaklyInvalidInput: isHyperbole,
    conversionFunction: i => distanceMap(i.map(j => j * 201.168)),
    ignoredUnits: metricDistanceUnits,
  },
  {
    imperialUnits: [/pounds?[ -]?(?:force)/, /lbf/, /lbs?[ -]?(?:force)/],
    standardInputUnit: ' lbf',
    isInvalidInput: isZeroOrNegative,
    isWeaklyInvalidInput: isHyperbole,
    conversionFunction: i => createMap(i.map(j => j * 4.44822), ' N'),
    ignoredUnits: metricForceUnits,
  },
  {
    imperialUnits: 'lbs?',
    weakImperialUnits: [/pounds?/],
    standardInputUnit: ' lb',
    isInvalidInput: isZeroOrNegative,
    isWeaklyInvalidInput: isHyperbole,
    conversionFunction: i => weightMap(i.map(j => j * 453.592)),
    ignoredUnits: metricWeightUnits,
    ignoredKeywords: ['football', 'soccer', 'fifa', 'bowling'],
    preprocess: (comment) => {
      const input = comment.body;
      const lbAndOz =
        new RegExp(
          (`${rh.startRegex
          + rh.numberRegex
          }[- ]?${
            rh.regexJoinToString([/lbs?/, /pounds?/])
          }[- ]?${
            rh.numberRegex
          }[- ]?${
            rh.regexJoinToString([/oz/, /ounces?/])}`
          ), 'gi',
        );
      return input.replace(lbAndOz, (match, lb, oz, offset, string) => {
        const ozLessThan16 = Number(oz) <= 16;
        if (ozLessThan16) {
          const lbNumeral = roundToDecimalPlaces(Number(lb.replace(/[^\d-\.]/g, '')) + Number(oz) / 16, 2);
          return ` ${lbNumeral} lb `;
        }
        return '  ';
      });
    },
    postprocessInput: (numbers) => {
      if (numbers.every((input) => input.toString().indexOf('.') === -1)) {
        return numbers.map(function(input, index) {
          if(index == numbers.length-1) {
            return `${rh.addCommas(input)} lb`;
          } else {
            return rh.addCommas(input);
          }
        });
      } else {
        return numbers.map((input) => `${rh.addCommas(Math.floor(input).toString())} lb ${
          roundToDecimalPlaces(input % 1 * 16, 0)} oz`);
      }
    },
  },
  {
    imperialUnits: [/(?:liquid|fluid|fl\.?)[ -]?(?:oz|ounces?)/,
      /(?:oz\.?|ounces?)[ -]?(?:liquid|fluid|fl)/],
    standardInputUnit: ' fl. oz.',
    isInvalidInput: isZeroOrNegative,
    isWeaklyInvalidInput: isHyperbole,
    conversionFunction: i => volumeMap(i.map(j => j * 0.0295735295625)),
    ignoredUnits: metricVolumeUnits,
    ignoredKeywords: ukSubreddits,
    preprocess: (comment) => {
      const input = comment.body;
      const ozRegex = new RegExp(
        (`${rh.startRegex
          + rh.numberRegex
        }[- ]?${
          rh.regexJoinToString([/oz/, /ounces?/])}`
        ), 'gi',
      );
      const ozAndLiquidRegex = new RegExp(
        (`${ozRegex.source
        }.+?\\b${
          rh.regexJoinToString(liquidKeywords)}`
        ), 'i',
      );

      if (!ozAndLiquidRegex.test(input)) {
        return input;
      }

      return input.replace(ozRegex, (oz, offset, string) => ` ${oz} fl. oz`);
    },
  },
  {
    imperialUnits: [/ozt/, /oz t/, /troy ounces?/],
    standardInputUnit: ' troy ounces',
    isInvalidInput: isZeroOrNegative,
    isWeaklyInvalidInput: isHyperbole,
    conversionFunction: i => weightMap(i.map(j => j * 31.1034768)),
    ignoredUnits: metricWeightUnits,
    preprocess: (comment) => {
      const input = comment.body;
      const specialSubredditsRegex = new RegExp(
        rh.regexJoinToString([/silverbugs/, /pmsforsale/, /coins/]),
        'gi',
      );
      const unitRegex = new RegExp(
        `${rh.startRegex}${rh.numberRegex}[- ]?${rh.regexJoinToString([/oz/, /ounces?/])}`,
        'gi',
      );

      if (specialSubredditsRegex.test(comment.subreddit)) {
        return input.replace(unitRegex, (match, oz, offset, string) => ` ${oz} troy ounces `);
      }
      return input;
    },
  },
  {
    imperialUnits: [/oz/, /ounces?/],
    standardInputUnit: ' oz',
    isInvalidInput: isZeroOrNegative,
    isWeaklyInvalidInput: isHyperbole,
    conversionFunction: i => weightMap(i.map(j => j * 28.3495)),
    ignoredUnits: ['oz t', 'ozt'].concat(metricWeightUnits),
    ignoredKeywords: ['leather', 'rawdenim'].concat(ukSubreddits)
  },
  {
    imperialUnits: [/teaspoons?/, /tsp/],
    standardInputUnit: ' tsp',
    isInvalidInput: isZeroOrNegative,
    isWeaklyInvalidInput: isHyperbole,
    conversionFunction: i => volumeMap(i.map(j => j * 0.00492892)),
    ignoredUnits: metricVolumeUnits,
  },
  {
    imperialUnits: [/tablespoons?/, /tbsp/, /tbl/],
    standardInputUnit: ' Tbsp',
    isInvalidInput: isZeroOrNegative,
    isWeaklyInvalidInput: isHyperbole,
    conversionFunction: i => volumeMap(i.map(j => j * 0.0147868)),
    ignoredUnits: metricVolumeUnits,
  },
  {
    imperialUnits: [/cups?/],
    standardInputUnit: ' cups (US)',
    isInvalidInput: isZeroOrNegative,
    isWeaklyInvalidInput: i => isHyperbole(i) || i > 100,
    conversionFunction: i => volumeMap(i.map(j => j * 0.24)),
    ignoredUnits: metricVolumeUnits,
    ignoredKeywords: ['bra', 'band', 'sizes?', 'clio', 'clashofclans', 'coc', 'clashroyale'],
  },
  {
    imperialUnits: [/pints?/],
    standardInputUnit: ' pints',
    isInvalidInput: isZeroOrNegative,
    isWeaklyInvalidInput: isHyperbole,
    conversionFunction: i => volumeMap(i.map(j => j * 0.473176)),
    ignoredUnits: metricVolumeUnits,
    ignoredKeywords: ukSubreddits,
  },
  {
    imperialUnits: [/quarts?/],
    standardInputUnit: ' quarts',
    isInvalidInput: isZeroOrNegative,
    isWeaklyInvalidInput: isHyperbole,
    conversionFunction: i => volumeMap(i.map(j => j * 0.946353)),
    ignoredUnits: metricVolumeUnits,
  },
  {
    imperialUnits: [/\(?(?:uk|imp(?:erial)?)\)? gal(?:lons?)?/,
      /gal(?:lons?)? \(?(?:uk|imp(?:erial)?\)?)/],
    standardInputUnit: ' gal (imp)',
    isInvalidInput: isZeroOrNegative,
    isWeaklyInvalidInput: isHyperbole,
    conversionFunction: i => volumeMap(i.map(j => j * 4.54609)),
    ignoredUnits: metricVolumeUnits,
  },
  {
    imperialUnits: [/gal(?:lons?)?/],
    standardInputUnit: ' gal (US)',
    isInvalidInput: isZeroOrNegative,
    isWeaklyInvalidInput: isHyperbole,
    conversionFunction: i => volumeMap(i.map(j => j * 3.78541)),
    ignoredUnits: ['imperial'].concat(metricVolumeUnits),
    ignoredKeywords: ukSubreddits,
  },
  {
    imperialUnits: [/pecks?/],
    standardInputUnit: ' pecks (US)',
    isInvalidInput: isZeroOrNegative,
    isWeaklyInvalidInput: isHyperbole,
    conversionFunction: i => volumeMap(i.map(j => j * 8.80977)),
    ignoredUnits: ['imperial'].concat(metricVolumeUnits),
    ignoredKeywords: ukSubreddits,
  },
  {
    imperialUnits: [/(?:°|degrees?) ?(?:f|fahrenheit)/, /fahrenheit/],
    weakImperialUnits: ['f', 'degrees?'],
    standardInputUnit: '°F',
    isInvalidInput: i => false,
    isWeaklyInvalidInput: i => i > 1000,
    conversionFunction: (i) => {
      const temperatureMap = createMap(i.map(j => (j - 32) * 5 / 9), '°C');
      const unitDecider = Math.max(...i);
      if (unitDecider > 0 && unitDecider < 32) {
        return [temperatureMap, createMap(i.map(j => j * 5 / 9), ' change in °C')];
      }
      return temperatureMap;
    },
    ignoredUnits: [/° ?C/, 'degrees? c', 'celsius', 'kelvin'],
  },
  {
    imperialUnits: [/acres?/],
    standardInputUnit: ' acres',
    isInvalidInput: isZeroOrNegative,
    isWeaklyInvalidInput: isHyperbole,
    conversionFunction: i => areaMap(i.map(j => j * 4046.8564)),
    ignoredUnits: [
      /square kilometers?/,
      /sq.? km/,
      /sq.? kilometers?/,
      /km[^]2/,
    ],
  },
  // {
  //   imperialUnits: [/bushels?/],
  //   standardInputUnit: ' bushels',
  //   isInvalidInput: isZeroOrNegative,
  //   isWeaklyInvalidInput: isHyperbole,
  //   conversionFunction: i => weightMap(i.map(j => j * 35239.07040000007)),
  //   ignoredUnits: metricWeightUnits,
  // },
  {
    imperialUnits: [/nmi/, /nautical\smiles?/],
    standardInputUnit: ' nmi',
    isInvalidInput: isZeroOrNegative,
    isWeaklyInvalidInput: isHyperbole,
    conversionFunction: i => distanceMap(i.map(j => j * 1852)),
    ignoredUnits: metricDistanceUnits,
  },
];

const unitLookupMap = unitLookupList.reduce((memo, map) => {
  memo[map.standardInputUnit] = map;
  return memo;
}, {});

function containsArray(searchSpace, targetArray) {
  for (const i in searchSpace) {
    if (JSON.stringify(searchSpace[i]) === JSON.stringify(targetArray)) {
      return true;
    }
  }
  return false;
}

const globalIgnore = ['kill', 'suicide', 'death', 'die', 'depression', 'crisis', 'emergency', 'therapy', 'therapist', 'murder', 'rip', 'rest in peace', 'fatal', 'shooting', 'shootings', 'casualties', 'casualty',

  'america', 'usa', 'united states',

  'dick', 'penis', 'dong', 'cock', 'member', 'phallus', 'wood', 'willy', 'pecker', 'manhood', 'boner', 'junk', 'wiener', 'shaft', 'dildo',
  'genitalia', 'clit', 'labia', 'pussy', 'vagina', 'snatch',
  'ass', 'anus', 'anal', 'butt', 'tit', 'kink', 'bdsm', 'blow job', 'jizz', 'cum',
  'nsfw', 'gonewild', 'sex', 'glory hole', 'cuck', 'porn', 'incest', 'piv', 'milf'];

function shouldConvertComment(comment, regexArray = globalIgnore, shouldBeUniqueWord = true) {
  const input = comment.body;
  const postTitle = comment.postTitle;
  const subreddit = comment.subreddit;

  const ignoredWordRegex = new RegExp(
    (shouldBeUniqueWord ? rh.startRegex : '')
    + rh.regexJoinToString(regexArray)
    + rh.endRegex
    , 'i',
  );

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
    const potentialConversions = [];
    const unitRegex = rh.regexJoinToString(unitArray);

    const rangeRegex = new RegExp(
      `${rh.startRegex
                         + rh.rangeRegex
      }(?=[ -]?${
        unitRegex
      }${rh.endRegex
      })`,
      'gi',
    );
    const rangeMatches = string.match(rangeRegex);
    if (rangeMatches) {
      rangeMatches
        .map((range) => {
          range = range.replace(/\(/, '\\(').replace(/\)/, '\\)');
          string = string.replace(new RegExp(`${range} ?${unitRegex}`, 'gi'), '');
          return range;
        })
        .map(range => range.replace(/\s/g, ''))
        .forEach((range) => {
          const match = range.match(/(?:\d)/.source + rh.rangeJoiners + /(?=-?\d)/.source);
          if (match) {
            const toIndex = match.index + 1;
            const joiner = match[1];

            const in1 = range.substring(0, toIndex).replace(/[^\d-\.]/g, '');
            const in2 = range.substring(toIndex + joiner.length).replace(/[^\d-\.]/g, '');

            potentialConversions.push({
              imperial: {
                numbers: [in1, in2],
                unit: standardUnit,
                joiner,
              },
            });
          } else {
            analytics.trackError([range, input, subreddit, postTitle]);
          }
        });
    }

    const regex = new RegExp(
      `${rh.startRegex
                    + rh.numberRegex
      }(?=[ -]?${
        unitRegex
      }${rh.endRegex
      })`,
      'gi',
    );
    const matches = string.match(regex);

    if (matches) {
      matches
        .map((match) => {
          match = match.replace(/\(/, '\\(').replace(/\)/, '\\)');
          string = string.replace(new RegExp(`${match} ?${unitRegex}`, 'gi'), '');
          return match;
        })
        .map(match => match.replace(/[^\d-\.]/g, ''))
        .forEach((match) => {
          potentialConversions.push({
            imperial: {
              numbers: [match],
              unit: standardUnit,
            },
          });
        });
    }

    return {
      potentialConversions,
      string,
    };
  }

  //---------------------------------------------------------

  const processedComment = unitLookupList.reduce((memo, map) => {
    if (map.preprocess) {
      memo.body = map.preprocess(memo);
      return memo;
    }
    return memo;
  }, comment);

  let processedInput = processedComment.body;

  const duplicateCache = {};

  return unitLookupList.reduce((memo, map) => {
    if (!shouldConvertComment(comment, map.ignoredKeywords) ||
        !shouldConvertComment(comment, map.ignoredUnits, false)) {
      return memo;
    }

    const conversions = findMatchForUnitsAndRemoveFromString(
      map.imperialUnits,
      map.standardInputUnit,
      processedInput,
    );

    processedInput = conversions.string;
    memo = memo.concat(conversions.potentialConversions);

    if (conversions.potentialConversions.length > 0) {
      const weakConversions = findMatchForUnitsAndRemoveFromString(
        map.weakImperialUnits,
        map.standardInputUnit,
        processedInput,
      );

      processedInput = weakConversions.string;
      memo = memo.concat(weakConversions.potentialConversions);
    }
    return memo;
  }, [])
  // Remove duplicate conversions
    .filter((item) => {
      const unit = item.imperial.unit;
      const numbers = item.imperial.numbers;
      if (duplicateCache[unit] === undefined) {
        duplicateCache[unit] = [numbers];
        return true;
      } else if (!containsArray(duplicateCache[unit], numbers)) {
        duplicateCache[unit].push(numbers);
        return true;
      }
      return false;
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
  const possiblyValidConversions = potentialConversions.filter((input) => {
    const imperialUnit = input.imperial.unit;
    const imperialNumbers = input.imperial.numbers;

    const map = unitLookupMap[imperialUnit];
    if (map.isInvalidInput) {
      for (item in imperialNumbers) {
        if (map.isInvalidInput(Number(imperialNumbers[item]))) {
          return false;
        }
      }
      return true;
    }
    return true;
  });

  const stronglyValidInput = possiblyValidConversions.filter((input) => {
    const imperialUnit = input.imperial.unit;
    const imperialNumbers = input.imperial.numbers;

    const map = unitLookupMap[imperialUnit];
    if (map.isWeaklyInvalidInput) {
      for (item in imperialNumbers) {
        if (map.isWeaklyInvalidInput(Number(imperialNumbers[item]))) {
          return false;
        }
      }
      return true;
    }
    return true;
  });

  if (stronglyValidInput.length == 0) {
    return [];
  }
  return possiblyValidConversions;
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
  return imperialInputs.map((input) => {
    const imperialUnit = input.imperial.unit;
    const imperialNumbers = input.imperial.numbers;

    const map = unitLookupMap[imperialUnit];
    input.metric = map.conversionFunction(imperialNumbers);

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
      multiplier = Math.pow(10, input.toString().split('.')[1].length);
    } else {
      multiplier = 1;
    }

    if (input < 0) {
      multiplier *= -1;
    }

    const nonDecimalInput = input * multiplier;

    const digits = nonDecimalInput.toString().length;

    let output;
    let unroundedDigits = 1;
    do {
      const roundingMultipler = Math.pow(10, digits - unroundedDigits);
      output = Math.round(nonDecimalInput / roundingMultipler) * roundingMultipler;
      unroundedDigits++;
    } while (Math.abs(output - nonDecimalInput) / nonDecimalInput * 100 > allowableErrorPercent);

    return output / multiplier;
  }

  function roundToDecimalPlaces(input, decimals) {
    const roundingMultipler = Math.pow(10, decimals);
    const number = Math.round(input * roundingMultipler) / roundingMultipler;
    return number.toFixed(decimals);
  }

  return conversions.map((conversion) => {
    function createMetricMap(imperial, metric, unit) {
      let rounded;
      const result = {
        numbers: [],
        unit,
      };

      result.numbers = imperial.map((item, index) => {
        if (item.toString().indexOf('.') !== -1) {
          const decimals = item.split('.')[1].length;
          return roundToDecimalPlaces(metric[index], decimals);
        } else if ((item > 100 || metric > 100) && item.toString()[item.length - 1] == '0') {
          return round(metric[index], 5).toString();
        }
        return round(metric[index], 3).toString();
      });
      return result;
    }

    const metricConversions = conversion.metric;
    const imperial = conversion.imperial.numbers;
    let map;
    if (Array.isArray(metricConversions)) {
      map = metricConversions.map(mc => createMetricMap(imperial, mc.numbers, mc.unit));
    } else {
      map = createMetricMap(imperial, conversion.metric.numbers, conversion.metric.unit);
    }

    conversion.rounded = map;
    return conversion;
  });
}

function formatConversion(conversions) {
  return conversions.map((conversion) => {
    const roundedConversions = conversion.rounded;
    if (Array.isArray(roundedConversions)) {
      conversion.formatted = roundedConversions.map(rc => ({
        numbers: rc.numbers.map(rh.addCommas),
        unit: rc.unit,
      }));
    } else {
      const metric = conversion.rounded.numbers;
      conversion.formatted = {
        numbers: metric.map(rh.addCommas),
        unit: conversion.rounded.unit,
      };
    }

    const imperialUnit = conversion.imperial.unit;
    const imperialNumbers = conversion.imperial.numbers;
    const imperialJoiner = conversion.imperial.joiner;

    const postprocessInput = unitLookupMap[imperialUnit].postprocessInput;
    if (postprocessInput) {
      conversion.imperial = {
        numbers: postprocessInput(imperialNumbers),
        unit: '',
      };
      if(imperialJoiner) {
        conversion['imperial']['joiner'] = imperialJoiner;
      }
    } else {
      conversion.imperial.numbers = imperialNumbers.map(rh.addCommas);
    }

    return conversion;
  });
}

module.exports = {
  globalIgnore,
  shouldConvertComment,
  findPotentialConversions,
  filterConversions,
  calculateMetric,
  roundConversions,
  formatConversion,
};
