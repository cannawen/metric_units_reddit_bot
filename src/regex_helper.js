Array.prototype.regexJoin = function() {
  return "(?:" + this.map(el => el.source || el).join("|") + ")";
}

String.prototype.regex = function() {
  return new RegExp(this, "gi");
}

String.prototype.addCommas = function() {
    var parts = this.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function roundToDecimalPlaces(number, places) {
  const multiplier = Math.pow(10, places);
  return ((Math.round(number * multiplier)/multiplier).toFixed(places));
}

const startRegex 
  = /(?:^|[\s~><\b\(])/.source;

const endRegex 
  = /(?:$|[\s\.,;?!:\b\)])/.source;

const numberRegex 
  = 
  "("
    + "(?:"
      + /-?/.source
      + [
          /\d+/,
          /\d{1,3}(?:,\d{3})+/
        ].regexJoin() 
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
  "roundToDecimalPlaces" : roundToDecimalPlaces,
  startRegex,
  endRegex,
  numberRegex,
  rangeRegex
}