function f2c(f) {
  return Math.round(((f - 32) * 5/9));
}

function mi2km(s) {
  var decimals;

  if (s.indexOf('.') !== -1) {
    decimals = s.split(".")[1].length;
  } else if (s < 5) {
    decimals = 1;
  } else {
    decimals = 0;
  }

  const multiplier = Math.pow(10, decimals);
  return (Math.round(s * 1.609344 * multiplier)/multiplier).toFixed(decimals);
}

function kmString(string) {
  switch (string) {
    case "mph":
    case "miles per hour":
      return "km/h";
    case "miles":
    case "mi":
    default:
      return "km"
  }
}

function removeCommas(x) {
  return x.replace(/,/g,'');
}

function addCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

const regularExpressions = [{
  "description" : "˚F range to ˚C range",
  "regex" : /(?:\s|^)(-?\d+) ?- ?(-?\d+) ?(?:degrees? F|°F|(?:(?:degrees |°)?(?:Fahrenheit|fahrenheit)))(?:\s|$|\b)/g,
  "replacement" : (_, firstTemp, secondTemp, offset, string) => f2c(firstTemp) + " to " + f2c(secondTemp) + '°C'
},
{
  "description" : "°F to °C",
  "regex" : /(?:\s|^)(-?\d+) ?(?:degrees? F|°F|(?:(?:degrees |°)?(?:Fahrenheit|fahrenheit)))(?:\s|$|\b)/g, 
  "replacement" : (_, number, offset, string) => f2c(number) + "°C"
},
{
  "description" : "miles with commas and decimals to kilometers",
  "regex" : /(?:\s|^)(\d{1,3}(?:,\d{3})+\.\d+)(?: ?)(miles?|mi|mph|miles? per hour)(?:\s|$|\b)/g,
  "replacement" : (_, number, units, offset, string) => addCommas(mi2km(removeCommas(number))) + " " + kmString(units)
},
{
  "description" : "decimal miles to kilometers",
  "regex" : /(?:\s|^)(\d+\.\d+)(?: ?)(miles?|mi|mph|miles? per hour)(?:\s|$|\b)/g,
  "replacement" : (_, number, units, offset, string) => mi2km(number) + " " + kmString(units)
},
{
  "description" : "miles with commas to kilometers",
  "regex" : /(?:\s|^)(\d{1,3}(?:,\d{3})+)(?: ?)(miles?|mi|mph|miles? per hour)(?:\s|$|\b)/g,
  "replacement" : (_, number, units, offset, string) => addCommas(mi2km(removeCommas(number))) + " " + kmString(units)
},
{
  "description" : "miles to kilometers",
  "regex" : /(?:\s|^)(\d+)(?: ?)(miles?|mi|mph|miles? per hour)(?:\s|$|\b)/g,
  "replacement" : (_, number, units, offset, string) => mi2km(number) + " " + kmString(units)
}];

function shouldConvert(input) {

  function hasPowerOfTenNumberOver10(input) {
    return input.match(/(?:\s|^)(100+|10{1,2}(?:,000))(?:\s|$|\b)/g)
  }

  function writtenByAnotherBot(input) {
    return input.match(/\bbot\b/g);
  }

  if (input.length > 300 
    || hasPowerOfTenNumberOver10(input) 
    || writtenByAnotherBot(input)) {

    return false;
  }

  for (var i = 0; i < regularExpressions.length; i++) {
    const matches = input.match(regularExpressions[i]["regex"]);
    if (matches != null) {
      return true;
    }
  }
  
  return false;
}

function conversions(input) {
  return regularExpressions.reduce((memo, regex) => {
    const matches = input.match(regex["regex"]);

    if (matches) {
      matches
        .map(match => match.trim())
        .filter(match => {
          return Object.keys(memo).reduce((m, k) => {
            return m && k.indexOf(match) === -1;
          }, true)
        })
        .forEach(match => {
          memo[match] = match.replace(regex["regex"], regex["replacement"]);
        });
    }
    
    return memo;
  }, {});
}

module.exports = {
  "shouldConvert" : shouldConvert,
  "conversions" : conversions
}
