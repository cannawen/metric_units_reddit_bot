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

function style(string) {
  return "**" + string + "**";
}

const regularExpressions = [{
  "description" : "˚F range to ˚C range",
  "regex" : /(^|\s|\()(-?\d+) ?- ?(-?\d+)( ?)(˚|°?)F\b/g,
  "replacement" : (_, start, firstTemp, secondTemp, space, degrees, offset, string) => start + style(f2c(firstTemp) + ' to ' + f2c(secondTemp) + space + degrees + 'C')
},
{
  "description" : "˚F to ˚C",
  "regex" : /(^|\s|\(|~|>|<)(-?\d+)( ?)(˚|°?)F\b/g, 
  "replacement" : (_, p0, p1, p2, p3, offset, string) => p0 + style(f2c(p1) + p2  + p3 + 'C')
},
{
  "description" : "miles with commas, decimals kilometers",
  "regex" : /(\d{1,3}(?:,\d{3})+\.(\d+))( ?)miles/g,
  "replacement" : (_, number, decimalPoints, space, offset, string) => style(addCommas(mi2km(removeCommas(number), decimalPoints.length)) + space + "kilometers")
},
{
  "description" : "miles with decimals kilometers",
  "regex" : /(\d+\.(\d+))( ?)miles/g,
  "replacement" : (_, number, decimalPoints, space, offset, string) => style(mi2km(number, decimalPoints.length) + space + "kilometers")
},
{
  "description" : "miles with commas to kilometers",
  "regex" : /(\d{1,3}(,\d{3})+)( ?)miles/g,
  "replacement" : (_, number, triplet, space, offset, string) => style(addCommas(mi2km(removeCommas(number))) + space + "kilometers")
},
{
  "description" : "miles to kilometers",
  "regex" : /(^|[^,])(\d+)( ?)miles/g,
  "replacement" : (_, start, miles, space, offset, string) => start + style(mi2km(miles) + space + "kilometers")
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
