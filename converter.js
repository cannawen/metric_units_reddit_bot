function f2c(f) {
  return Math.round(((f - 32) * 5/9));
}

function mi2km(s, decimals) {
  if (decimals === undefined) {
    decimals = s < 5 ? 1 : 0;
  }
  const multiplier = Math.pow(10, decimals);
  return Math.round(s * 1.609344 * multiplier)/multiplier;
}

function removeCommas(x) {
  return x.replace(/,/g,'');
}

function addCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function kmString(miles) {
  switch (miles) {
    case "mph":
      return "km/h";
    case "mi":
      return "km";
    case "miles":
    default:
      return "kilometers";
  }
}

function style(string) {
  return "**" + string + "**";
}

const regularExpressions = [{
  "description" : "˚F range to ˚C range",
  "regex" : /(^|\s|\()(-?\d+) ?- ?(-?\d+)( ?)(˚|°|(degrees )?)(?:F|fahrenheit|Fahrenheit)\b/g,
  "replacement" : (_, start, firstTemp, secondTemp, space, degrees, offset, string) => start + style(f2c(firstTemp) + ' to ' + f2c(secondTemp) + space + degrees + 'C')
},
{
  "description" : "˚F to ˚C",
  "regex" : /(^|\s|\(|~|>|<)(-?\d+)( ?)(˚|°|(degrees )?)(?:F|fahrenheit|Fahrenheit)\b/g, 
  "replacement" : (_, p0, p1, p2, p3, offset, string) => p0 + style(f2c(p1) + p2  + p3 + 'C')
},
{
  "description" : "miles with commas, decimals kilometers",
  "regex" : /(^|\s|\(|~|>|<)(\d{1,3}(?:,\d{3})+\.(\d+))( ?)(miles|mph|mi)\b/g,
  "replacement" : (_, start, number, decimalPoints, space, miles, offset, string) => start + style(addCommas(mi2km(removeCommas(number), decimalPoints.length)) + space + kmString(miles))
},
{
  "description" : "miles with decimals kilometers",
  "regex" : /(^|\s|\(|~|>|<)(\d+\.(\d+))( ?)(miles|mph|mi)\b/g,
  "replacement" : (_, start, number, decimalPoints, space, miles, offset, string) => start + style(mi2km(number, decimalPoints.length) + space + kmString(miles))
},
{
  "description" : "miles with commas to kilometers",
  "regex" : /(^|\s|\(|~|>|<)(\d{1,3}(,\d{3})+)( ?)(miles|mph|mi)\b/g,
  "replacement" : (_, start, number, triplet, space, miles, offset, string) => start + style(addCommas(mi2km(removeCommas(number))) + space + kmString(miles))
},
{
  "description" : "miles to kilometers",
  "regex" : /(^|\s|\(|~|>|<)(\d+)( ?)(miles|mph|mi)\b/g,
  "replacement" : (_, start, number, space, miles, offset, string) => start + style(mi2km(number) + space + kmString(miles))
}];

function shouldConvert(input) {
  for (var i = 0; i < regularExpressions.length; i++) {
    if (input.match(regularExpressions[i]["regex"]) != null) {
      return true;
    }
  }
  return false;
}

function convertString(input) {
  return regularExpressions.reduce((memo, regex) => {
    return memo.replace(regex["regex"], regex["replacement"])
  }, input);
}

module.exports = {
  "shouldConvert" : shouldConvert,
  "convertString" : convertString
}
