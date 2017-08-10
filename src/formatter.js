const environment = require('./helper').environment();

function formatReply(original, conversions) {
  var message;
  if (original.length < 50) {
    message = inPlaceConversion(original, conversions);
  } else {
    message = tabularData(conversions);
  }

  return message; + "\n\n&nbsp;\n\n&nbsp;"
    + "^I ^am ^a ^bot ^| ^[source](https://github.com/cannawen/metric_units_reddit_bot) ^| ^" + environment['version'];
}

function inPlaceConversion(original, conversions) {
  return Object.keys(conversions).sort(function(a, b) {
      return b.length - a.length;
    }).reduce((memo, nonSIvalue) => {
      return memo.replace(
        new RegExp(nonSIvalue, 'g'), 
        "**" + conversions[nonSIvalue] + "**");
    }, original);
}

function tabularData(conversions) {
  return Object.keys(conversions).reduce((memo, nonSIvalue) => {
    const SIvalue = conversions[nonSIvalue];
    return memo + nonSIvalue + "|" + SIvalue + "\n";
  }, "Original measurement | SI measurement\n---|---\n")
}

module.exports = {
  "formatReply" : formatReply
}
