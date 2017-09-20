const analytics = require('./analytics');
const rh = require('./regex_helper');
const ch = require('./conversion_helper');

function conversions(comment) {
  if (!ch.shouldConvertComment(comment)) {
    return {};
  }

  const potentialConversions = ch.findPotentialConversions(comment);
  const filteredConversions = ch.filterConversions(potentialConversions);
  const metricConversions = ch.calculateMetric(filteredConversions);
  const roundedConversions = ch.roundConversions(metricConversions);
  const formattedConversions = ch.formatConversion(roundedConversions);
  
  return formattedConversions.reduce((m, c) => {
    const key = c['imperial']['number'] + c['imperial']['unit'];
    const value = c['rounded']['number'] + c['rounded']['unit'];
    
    m[key] = value ;
    return m;
  }, {});
}

module.exports = {
  "conversions" : conversions
}
