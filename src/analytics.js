const fs = require('fs');
const mkdirp = require('mkdirp');

const helper = require('./helper');

const environment = helper.environment();
const folder = `./private/analytics/${environment.version}/`;
mkdirp(folder);

function track(category, data) {
  const dataString = `${data
    .map(d => JSON.stringify(d))
    .map(d => d.replace(/[,\n"]/gi, ''))
    .join(',')}\n`;

  if (environment['dev-mode']) {
    helper.log(dataString);
  } else {
    fs.appendFileSync(`${folder + category}.csv`, dataString, 'utf8');
  }
}

function trackPersonality(data) {
  track('personality', data);
}

function trackConversion(data) {
  track('conversion', data);
}

function trackEdit(data) {
  track('edit', data);
}

function trackUnsubscribe(data) {
  track('unsubscribe', data);
}

function trackError(data) {
  track('error', data);
}

module.exports = {
  trackPersonality,
  trackConversion,
  trackEdit,
  trackUnsubscribe,
  trackError,
};
