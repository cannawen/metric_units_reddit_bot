const rh = require('./regex_helper');

const unitLookupList = [
  {
    "inputUnits" : [/-?mpg/, /miles per gal(?:lon)?/],
    "standardInputUnit" : " mpg (US)",
    
    "shouldConvert" : (i) => isNotHyperbole(i) && i >= 10 && i < 235,
    "inDisplay" : (i) => userFacingValueAndUnit(i, " mpg (US)"),
    "inDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " mpg (US)"),
    "outDisplay" : (i) => userFacingValueAndUnit(i, " L/100km", mpgToLper100km, currRound(5)),
    "outDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " L/100km", mpgToLper100km, currRound(5)),
    "ignoredKeywords" : ["basketball", "hockey", "soccer", "football", "rugby", "lacrosse", "cricket", "volleyball", "polo",
                         "nba", "nhl", "nfl", "sport",
                         "play", "game",
                         "britain", "british", "england", "scotland", "wales", "uk"]
  },
  {
    "inputUnits" : [/-?mph/, /miles (?:an|per) hour/],
    "standardInputUnit" : " mph",

    "shouldConvert" : (i) => isNotHyperbole(i) && i > 0 && [1, 10, 60, 88].indexOf(i) === -1,
    "inDisplay" : (i) => userFacingValueAndUnit(i, " mph"),
    "inDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " mph"),
    "outDisplay" : (i) => userFacingValueAndUnit(i, " km/h", milesToKm, currRound(5)),
    "outDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " km/h", milesToKm, currRound(5)),
    "ignoredKeywords" : ["britain", "british", "england", "scotland", "wales", "uk"]
  },
  {
    "inputUnits" : [/-?feet/, /-ft/, /-?foot/],
    "weakInputUnits" : [/[']/, /ft/],
    "standardInputUnit" : " feet",

    "shouldConvert" : (i) => isNotHyperbole(i) && i > 0 && [1, 2, 4, 6].indexOf(i) === -1 && !(i > 4 && i < 8),
    "inDisplay" : (i) => {
      if (i%1 == 0) {
        return userFacingValueAndUnit(i.split('.')[0], " ft");
      } else {
        return convertDecimalFeetToFeetAndInches(i);
      }
    },
    "inDisplayRange" : (i, j) => {
      if (i%1 == 0 && j%1 == 0) {
        return userFacingValueAndUnitRange(i.split('.')[0], j.split('.')[0], " ft");
      } else {
        return convertDecimalFeetToFeetAndInches(i) + " to " + convertDecimalFeetToFeetAndInches(j);
      }
    },
    "outDisplay" : (i) => userFacingValueAndUnit(i, " metres", feetToMetres, currRound(5)),
    "outDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " metres", feetToMetres, currRound(5)),
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
    "ignoredKeywords" : ["size"]
  },
  {
    "inputUnits" : [/-in/, /-?inch/, /inches/],
    "weakInputUnits" : [/["]/, /''/],
    "standardInputUnit" : " inches",

    "shouldConvert" : (i) => isNotHyperbole(i) && i > 0 && i != 1,
    "inDisplay" : (i) => userFacingValueAndUnit(i, " inches"),
    "inDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " inches"),
    "outDisplay" : (i) => userFacingValueAndUnit(i, " cm", inchesToCm, currRound(5)),
    "outDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " cm", inchesToCm, currRound(5)),
    "ignoredKeywords" : ["monitor", "monitors", "screen", "tv", "tvs",
                        "ipad", "iphone", "phone", "tablet", "tablets",
                        "apple", "windows", "linux", "android", "ios",
                        "macbook", "laptop", "laptops", "computer", "computers", "notebook", "imac", "pc", "dell", "thinkpad", "lenovo",
                        "rgb", "hz"]
  },
  {
    "inputUnits" : "-?lbs?",
    "weakInputUnits" : [/-?pound/, /-?pounds/],
    "standardInputUnit" : " lb",

    "shouldConvert" : (i) => isNotHyperbole(i) && i > 0,
    "inDisplay" : (i) => userFacingValueAndUnit(i, " lb"),
    "inDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " lb"),
    "outDisplay" : (i) => userFacingValueAndUnit(i, " kg", lbToKg, currRound(5)),
    "outDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " kg", lbToKg, currRound(5)),
  },
  {
    "inputUnits" : [/-?mi/, /-?miles?/],
    "standardInputUnit" : " miles",

    "shouldConvert" : (i) => isNotHyperbole(i) && i > 0 && [1, 8, 10].indexOf(i) === -1,
    "inDisplay" : (i) => userFacingValueAndUnit(i, " miles"),
    "inDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " miles"),
    "outDisplay" : (i) => userFacingValueAndUnit(i, " km", milesToKm, currRound(5)),
    "outDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, " km", milesToKm, currRound(5)),
    "ignoredKeywords" : ["churn", "credit card", "visa", "mastercard", "awardtravel",
                         "air miles", "aeroplan", "points",
                         "britain", "british", "england", "scotland", "wales", "uk",
                         "italy", "italian", "croatia", "brasil", "brazil"]
  },
  {
    "inputUnits" : [/(?:°|-?degrees?) ?(?:f|fahrenheit)/, /-?fahrenheit/],
    "weakInputUnits" : ["f", "-?degrees?"],
    "standardInputUnit" : "°F",

    "inDisplay" : (i) => userFacingValueAndUnit(i, "°F"),
    "inDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, "°F"),
    "outDisplay" : (i) => userFacingValueAndUnit(i, "°C", fahrenheitToCelsius, Math.round),
    "outDisplayRange" : (i, j) => userFacingValueAndUnitRange(i, j, "°C", fahrenheitToCelsius, Math.round)
  }
]

function roundToDecimalPlaces(number, places) {
  const multiplier = Math.pow(10, places);
  return (Math.round(number * multiplier)/multiplier).toFixed(places);
}

/*
  Input: String
    "1-2 mi away at 3 miles an hour"
  Output: Array of input numbers and standardized units
    [
      { "inputNumber" : 1, "inputUnit" : " miles" },
      { "inputNumber" : 2, "inputUnit" : " miles" },
      { "inputNumber" : 3, "inputUnit" : " mph" }
    ]
*/
function findPotentialConversions(input) {
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
                "inputNumber" : in1, 
                "inputUnit" : standardUnit
              })
              potentialConversions.push({
                "inputNumber" : in2, 
                "inputUnit" : standardUnit
              })
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
            "inputNumber" : match, 
            "inputUnit" : standardUnit
          })
        });
    }

    return {
      'potentialConversions' : potentialConversions,
      'string' : string
    };
  }

  //---------------------------------------------------------

  let processedInput = unitLookupList.reduce((memo, map) => {
    if (map["preprocess"]) {
      return map["preprocess"](input);
    } else {
      return memo;
    }
  }, input)

  return unitLookupList.reduce((memo, map) => {
    const conversions = findMatchForUnitsAndRemoveFromString(
                          map['inputUnits'],
                          map['standardInputUnit'], 
                          processedInput);
    processedInput = conversions['string'];
    memo = memo.concat(conversions['potentialConversions']);

    if (conversions['potentialConversions'].length > 0) {
      const weakConversions = findMatchForUnitsAndRemoveFromString(
                                map['weakInputUnits'],
                                map['standardInputUnit'], 
                                processedInput);

      processedInput = weakConversions['string'];
      memo = memo.concat(weakConversions['potentialConversions']);
    }
    return memo;
  }, []);
}

module.exports = {
  "findPotentialConversions" : findPotentialConversions
}