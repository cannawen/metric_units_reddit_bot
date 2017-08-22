Array.prototype.regexJoin = function() {
  return "(?:" + this.map(el => {
    const source = el.source
    if (source) {
      return source;
    } else {
      return el;
    }
  }).join("|") + ")";
}

String.prototype.regex = function() {
  return new RegExp(this, "gi");
}

String.prototype.addCommas = function() {
    var parts = this.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

const startRegex 
  = /(?:^|[\s~><\b])/.source;

const endRegex 
  = /(?:$|[\s\.,;?!:\b])/.source;

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
  startRegex,
  endRegex,
  numberRegex,
  rangeRegex
}