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
    function parse(item) {
      let result = item[0];
      if(item.length > 1){
        result += '-'+item[1];
      }
      return result;
    }
    let key = parse(conversion['imperial']['number']);
    key += conversion['imperial']['unit'];
    const formatted = conversion['formatted'];

    let value;
    if (Array.isArray(formatted)) {
      value = formatted.map(el => parse(el['number']) + el['unit']).join(' or ');
    } else {
      value = parse(formatted['number']) + formatted['unit'];
    }
    
    memo[key] = value ;
    return memo;
  }, {});
}

module.exports = {
  "conversions" : conversions
}
