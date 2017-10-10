const analytics = require('./analytics');
const rh = require('./regex_helper');
const ch = require('./conversion_helper');

function conversions(comment) {
  if (!ch.shouldConvertComment(comment)) {
    return {};
  }

  const preprocessedcomment = ch.preprocessComment(comment);
  const potentialConversions = ch.findPotentialConversions(preprocessedcomment);
  const filteredConversions = ch.filterConversions(potentialConversions);
  const metricConversions = ch.calculateMetric(filteredConversions);
  const roundedConversions = ch.roundConversions(metricConversions);
  const formattedConversions = ch.formatConversion(roundedConversions);
  
  return formattedConversions.reduce((memo, conversion) => {
    const key = conversion['imperial']['numbers'].join('-') + conversion['imperial']['unit'];
    const formatted = conversion['formatted'];

    let value;
    if (Array.isArray(formatted)) {
      value = formatted.map(el => el['numbers'].join('-') + el['unit']).join(' or ');
    } else {
      value = formatted['numbers'].join('-') + formatted['unit'];
    }
    
    memo[key] = value ;
    return memo;
  }, {});
}

module.exports = {
  "conversions" : conversions
}
