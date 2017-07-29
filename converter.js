const regularExpressions = [{
  "description" : "˚F to ˚C",
  "regex" : /(-?\d+)(˚?)F/g, 
  "replacement" : (_, p1, p2, offset, string) => Math.round(((p1 - 32) * 5/9)) + p2 + 'C'
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
