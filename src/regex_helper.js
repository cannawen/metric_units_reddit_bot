function regexJoinToString(input) {
  if (Array.isArray(input)) {
    return "(?:" + input.map(el => el.source || el).join("|") + ")";
  } else {
    return "(?:" + input + ")";
  }
}

function addCommas(number) {
    var parts = number.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

const startRegex 
  = /(?:^|[\s~><\b\(`])/.source;

const endRegex 
  = /(?:$|[\s\.,;?!:\b)/`])/.source;

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
  startRegex,
  endRegex,
  numberRegex,
  rangeRegex
}