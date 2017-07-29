function f2c(f) {
  return Math.round(((f - 32) * 5/9));
}

const regularExpressions = [{
  "description" : "˚F range to ˚C range",
  "regex" : /(^|\s|\()(-?\d+) ?- ?(-?\d+)( ?)(˚|°?)F\b/g,
  "replacement" : (_, start, firstTemp, secondTemp, space, degrees, offset, string) => start + f2c(firstTemp) + ' to ' + f2c(secondTemp) + space + degrees + 'C'
},
{
  "description" : "˚F to ˚C",
  "regex" : /(^|\s|\(|~|>|<)(-?\d+)( ?)(˚|°?)F\b/g, 
  "replacement" : (_, p0, p1, p2, p3, offset, string) => p0 + f2c(p1) + p2  + p3 + 'C'
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
