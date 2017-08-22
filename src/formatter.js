const environment = require('./helper').environment();

function formatReply(comment, conversions) {
  return tabularData(conversions)
    + "\n\n&nbsp;"
    + "\n\n&nbsp;"
    + "^metric ^units ^bot" 
    + " ^|"
    + " ^[feedback](https://www.reddit.com/message/compose?to=cannawen&subject=metric%20units%20bot&message=I%20think%20your%20bot%20is...%20%5BPlease%20include%20a%20link%20if%20you%20are%20reporting%20a%20bug%20about%20a%20specific%20comment!%5D)"
    + " ^|"
    + " ^[source](https://github.com/cannawen/metric_units_reddit_bot)"
    + " ^|"
    + " ^[stop](https://www.reddit.com/message/compose?to=metric_units&subject=stop&message=If%20you%20would%20like%20to%20stop%20seeing%20this%20bot%27s%20comments%2C%20please%20send%20this%20private%20message%20with%20the%20subject%20%27stop%27.%20If%20you%20are%20a%20moderator%2C%20please%20go%20to%20https%3A%2F%2Fwww.reddit.com%2Fr%2F" + comment['subreddit'] + "%2Fabout%2Fbanned%2F)"
    + " ^|"
    + " ^" + environment['version'];
}

function tabularData(conversions) {
  return Object
    .keys(conversions)
    .reduce((memo, nonSIvalue) => {
      const SIvalue = conversions[nonSIvalue];
      return memo + nonSIvalue + "|" + SIvalue + "\n";
    }, "Original measurement | Metric measurement\n---|---\n");
}

module.exports = {
  "formatReply" : formatReply
}
