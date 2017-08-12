const environment = require('./helper').environment();

function formatReply(original, conversions) {
  return tabularData(conversions)
    + "\n\n&nbsp;"
    + "\n\n&nbsp;"
    + "^metric ^units ^bot" 
    + " ^|"
    + " ^[feedback](https://www.reddit.com/message/compose?to=cannawen&subject=metric%20units%20bot&message=I%20think%20your%20bot%20is)"
    + " ^|"
    + " ^[source](https://github.com/cannawen/metric_units_reddit_bot)"
    + " ^|"
    + " ^" + environment['version'];
}

function tabularData(conversions) {
  return Object.keys(conversions).reduce((memo, nonSIvalue) => {
    const SIvalue = conversions[nonSIvalue];
    return memo + nonSIvalue + "|" + SIvalue + "\n";
  }, "Original measurement | Metric measurement\n---|---\n")
}

module.exports = {
  "formatReply" : formatReply
}
