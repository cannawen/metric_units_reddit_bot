function createMap(values, unit, transform = i => i) {
  return {
    "numbers" : values.map((i) => transform(i).toString()),
    "unit" : unit
  };
}

function roundToDecimalPlaces(number, places) {
  const multiplier = Math.pow(10, places);
  return (Math.round(number * multiplier)/multiplier).toFixed(places);
}

function isZeroOrNegative(i) {
  return i <= 0;
}

function isHyperbole(i) {
  const isOneFollowedByZeros = i.toString().match(/^-? ?100+(?:\.0+)?$/) !== null;
  const isOneFollowedByExponentTerm = i.toString().match(/1e(?:\d)*/) !== null;
  return isOneFollowedByZeros || isOneFollowedByExponentTerm;
}

const ukSubreddits = ["britain", "british", "england", "english", "scotland", "scottish", "wales", "welsh", "ireland", "irish", "london", "uk"];

module.exports = {
  "createMap" : createMap,
  "roundToDecimalPlaces" : roundToDecimalPlaces,

  "isZeroOrNegative" : isZeroOrNegative,
  "isHyperbole" : isHyperbole,

  "ukSubreddits" : ukSubreddits
}
