const environment = require('./helper').environment();

const stopMessage = "Please send this message with the subject 'stop' to block this bot.\n\nSo long, and thanks for all the fish";

function formatReply(comment, conversions) {
  let species = "bot"
  let source = "source"
  let version = environment['version'];
  let subreddit = comment['subreddit'];
  let commentId = comment['id'];
  let transform = (x) => x;

  if (comment['subreddit'].match(/^totallynotrobots$/i)) {
    species = "HUMAN";
    source =  "~~SOURCE~~";
    version = "age" + String(environment['version']).slice(1).toUpperCase();
    subreddit = "I_AM_HUMAN_DO_NOT_BAN"
    transform = (x) => x.toUpperCase();
  }

  const items = [
    {"value" : "metric units " + species },
    {"type" : "link", "value" : "feedback", "href" : "https://redd.it/73edn2" },
    {"type" : "link", "value" : "source", "href" : "https://github.com/cannawen/metric_units_reddit_bot" },
    {"type" : "link", "value" : "hacktoberfest", "href" : "https://redd.it/73ef7e" },
    {"type" : "link", "value" : "block", "href" : formatRedditComposeLink(environment['reddit-username'], 'block', stopMessage) },
    {"type" : "link", "value" : "refresh conversion", "href" : formatRedditComposeLink(environment['reddit-username'], 'refresh ' + commentId, "Please click 'send' below and I will update my comment to convert any new or updated values in your comment.") },
    {"value" : version }
  ];

  const footer = items.map(item => {
    item.value = transform(item.value);
    item.value = '^' + item.value.replace(/ /g, ' ^');

    if (item.type == 'link') {
      item.value = `[${item.value}](${item.href})`;
    }

    return item.value;
  }).join(' ^| ');

  return Object.keys(conversions)
    .map(nonMetricValue => nonMetricValue + " ≈ " + conversions[nonMetricValue])
    .map(transform)
    .join("  \n") + '\n\n' + footer;
}

function formatRedditComposeLink(to, subject, message) {
  return 'https://www.reddit.com/message/compose?to=' + to + '&subject=' + encodeURIComponent(subject) + '&message=' + encodeURIComponent(message);
}

module.exports = {
  stopMessage,
  "formatReply" : formatReply
}
