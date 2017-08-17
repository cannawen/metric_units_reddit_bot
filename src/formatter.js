const environment = require('./helper').environment();

function formatReply(comment, conversions) {
  return tabularData(conversions)
    + "\n\n&nbsp;"
    + "\n\n&nbsp;"
    + "^metric ^units ^bot" 
    + " ^|"
    + " ^[feedback](https://www.reddit.com/message/compose?to=cannawen&subject=metric%20units%20bot&message=I%20think%20your%20bot%20is%20...%20(be%20sure%20to%20include%20a%20link%20if%20you%20are%20making%20a%20bug%20report%20about%20a%20specific%20comment))"
    + " ^|"
    + " ^[source](https://github.com/cannawen/metric_units_reddit_bot)"
    + " ^|"
    + " ^[stop](https://www.reddit.com/r/" + comment['subreddit'] + "/about/banned/)"
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
