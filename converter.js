function shouldConvert(input) {
  return input.match(/(-?\d+(?:\.\d*)?)˚F\b/g) !== null;
}

function convertString(input) {
  function convert(str, p1, offset, input) {
    return Math.round(((p1 - 32) * 5/9)) + '˚C';
  }
  var test = /(-?\d+(?:\.\d*)?)˚F\b/g;
  return input.replace(test, convert);
}

module.exports = {
  "shouldConvert" : shouldConvert,
  "convertString" : convertString
}