const analytics = require('./analytics');
const rh = require('./regex_helper');
const ch = require('./conversion_helper');
const pp = require('./preprocess');

function conversions(comment) {
  if (!ch.shouldConvertComment(comment)) {
    return {};
  }

  const preprocessedcomment = pp.preprocessComment(comment);
  const potentialConversions = ch.findPotentialConversions(preprocessedcomment);
  const filteredConversions = ch.filterConversions(potentialConversions);
  const metricConversions = ch.calculateMetric(filteredConversions);
  const roundedConversions = ch.roundConversions(metricConversions);
  const formattedConversions = ch.formatConversion(roundedConversions);
  
  return formattedConversions.reduce((memo, conversion) => {
    let joiner = "";
    if("joiner" in conversion['imperial']) {
      joiner = " " + conversion['imperial']['joiner'] + " ";
    }
    const key = conversion['imperial']['numbers'].join(joiner) + conversion['imperial']['unit'];
    const formatted = conversion['formatted'];

    let value;
    if (Array.isArray(formatted)) {
      value = formatted.map(el => el['numbers'].join(joiner) + el['unit']).join(' or ');
    } else {
      value = formatted['numbers'].join(joiner) + formatted['unit'];
    }
    
    memo[key] = value ;
    return memo;
  }, {});
}

module.exports = {
  "conversions" : conversions
}
