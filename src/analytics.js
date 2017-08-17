const ua = require('universal-analytics');

const helper = require('./helper');

const environment = helper.environment();
const analyticsKey = environment['google-analytics-key'];

const ga = ua(analyticsKey, environment['version'], { https: true, strictCidFormat: false });

function trackSnark(link, message, replied) {
  track("snark", link, message + "\n" + replied.toString());
}

function trackConversion(link, message, conversions) {
  track("conversion", link, message + "\n" + conversions.toString());
}

function track(category, action, label) {
  if (analyticsKey) {
    if (environment['dev-mode']) {
      helper.log(category, action, label);
    } else {
      ga.event(category, action, label)
    }
  }
}

module.exports = {
  "trackSnark" : trackSnark,
  "trackConversion" : trackConversion
}
