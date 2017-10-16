const environment = require('./helper').environment();

const stopMessage = "Please click 'block user' below and you will not see any more conversions from this bot. This bot will also block you, so it will not convert anything you post.\n\nSo long, and thanks for all the fish";

function formatRedditComposeLink(to, subject, message) {
  return `https://www.reddit.com/message/compose?to=${to}&subject=${encodeURIComponent(subject)}&message=${encodeURIComponent(message)}`;
}

function formatReply(comment, conversions) {
  let species = 'bot';
  let { version } = environment.version;
  const commentId = comment.id;
  let transform = x => x;

  if (comment.subreddit.match(/^totallynotrobots$/i)) {
    species = 'HUMAN';
    version = `age${String(version).slice(1).toUpperCase()}`;
    transform = x => x.toUpperCase();
  }

  const items = [
    { value: `metric units ${species}` },
    { type: 'link', value: 'feedback', href: 'https://redd.it/73edn2' },
    { type: 'link', value: 'source', href: 'https://github.com/cannawen/metric_units_reddit_bot' },
    { type: 'link', value: 'hacktoberfest', href: 'https://redd.it/73ef7e' },
    { type: 'link', value: 'block', href: formatRedditComposeLink(environment['reddit-username'], 'stop', 'Please send this private message with the subject \'stop\' to block this bot') },
    { type: 'link', value: 'refresh conversion', href: formatRedditComposeLink(environment['reddit-username'], `refresh ${commentId}`, "Please click 'send' below and I will update my comment to convert any new or updated values in your comment.") },
    { value: version },
  ];

  const footer = items.map((item) => {
    item.value = transform(item.value);
    item.value = `^${item.value.replace(/ /g, ' ^')}`;

    if (item.type === 'link') {
      item.value = `[${item.value}](${item.href})`;
    }

    return item.value;
  }).join(' ^| ');

  return `${Object.keys(conversions)
    .map(nonMetricValue => `${nonMetricValue} ≈ ${conversions[nonMetricValue]}`)
    .map(transform)
    .join('  \n')}\n\n${footer}`;
}

module.exports = {
  stopMessage,
  formatReply,
};
