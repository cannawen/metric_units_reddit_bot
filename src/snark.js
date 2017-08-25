const helper = require('./helper');
const replier = require('./reply_maker');

function humanReply(message) {

  if (message.match(/good bot|bad bot/i)) {
    return replier.humanReply.randomElement();
  }

  if (message.match(/good human|good fellow human/i)) {
    return replier.goodHumanReply.randomElement();
  }

}

function reply(message) {
  const goodMatch = message.match(/good bot/i);
  const badMatch = message.match(/bad bot/i);

  if (goodMatch && badMatch) {
    return replier.confusedReply.randomElement();
  }

  if (goodMatch) {
    return replier.goodReply.randomElement();
  } 

  if (badMatch) {
    return replier.badReply.randomElement();
  } 

  if (message.match(/i love you/i)) {
    return replier.loveReply.randomElement();
  } 

  if (message.match(/stupid bot|dumb bot|useless bot/i)) {
    return replier.stupidReply.randomElement();
  } 

  if (message.match(/thanks|thank you/i)) {
    return replier.thanksReply.randomElement();
  } 

  if (message.match(/^what is love.?$/i)) {
    return replier.whatIsLove["What is love?"];
  } 

  if (message.match(/^baby,? don'?t hurt me.?$/i)) {
    return replier.whatIsLove["Baby don't hurt me"];
  } 

  if (message.match(/^don'?t hurt me.?$/i)) {
    return replier.whatIsLove["Don't hurt me"];
  } 

  if (message.match(/^no more.?$/i)) {
    return replier.whatIsLove["No more"];
  }
}

Array.prototype.randomElement = function () {
  const weightedArray = this.reduce((memo, el) => {
    if (Array.isArray(el)) {
      const additions = Array(el[0]).fill(el[1]);
      return memo.concat(additions);
    } else if(typeof el == 'string' || el instanceof String) {
      memo.push(el);
    }
    return memo;
  }, []);
  return weightedArray[Math.floor(helper.random() * weightedArray.length)];
}

module.exports = {
  "humanReply" : humanReply,
  "reply" : reply
}
