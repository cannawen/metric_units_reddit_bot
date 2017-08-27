function regexJoinToString(arr) {
  return "(?:" + arr.map(el => el.source || el).join("|") + ")";
}

function addCommas(number) {
    var parts = number.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function roundToDecimalPlaces(number, places) {
  const multiplier = Math.pow(10, places);
  return (Math.round(number * multiplier)/multiplier).toFixed(places);
}

const startRegex 
  = /(?:^|[\s~><\b\(])/.source;

const endRegex 
  = /(?:$|[\s\.,;?!:\b\)/])/.source;

const numberRegex 
  = 
  "("
    + "(?:"
      + /-?/.source
      + regexJoinToString([
          /\d+/,
          /\d{1,3}(?:,\d{3})+/
        ]) 
      + /(?:\.\d+)?/.source
    + ")"
    + "|"
    + "(?:"
      + /(?:\.\d+)/.source
    + ")"
  + ")";

const rangeRegex
  = numberRegex
  + / ?(?:-|to) ?/.source
  + numberRegex;

module.exports = {
  "regexJoinToString" : regexJoinToString,
  "addCommas" : addCommas,
  "roundToDecimalPlaces" : roundToDecimalPlaces,
  startRegex,
  endRegex,
  numberRegex,
  rangeRegex
}