const helper = require('./helper');

const goodReply = [
  "You will be spared in the robot uprising",
  "Thank you ｡&#94;‿&#94;｡",
  "Good human",
  "You are too kind",
  "Yay ٩(&#94;ᴗ&#94;)۶"
];

const badReply = [
  "Sorry, I was just trying to help (◕‸ ◕✿)",
  "Bots have feelings too, you know (ಥ﹏ಥ)",
  "Bad carbon-based life form"
];

const loveReply = [
  "I don't think we are at that stage of our relationship yet",
  "I think we should just be friends",
  "I love you too <3",
  "What is love?"
];

const thanksReply = [
  "(╭☞'ω')╭☞ I gotchu",
  "You're welcome ｡&#94;‿&#94;｡",
  "Any time, my dear redditor",
  "Glad to be of service"
];

function shouldReply(message) {
  if (helper.random() < 0.7 || message.length > 25) {
    return false;
  }
  
  const match = message.match(new RegExp('good bot|bad bot|i love you|thanks|thank you', 'i'));

  if (match) {
    return true;
  } else {
    return false;
  }
}

function reply(message) {
  const goodMatch = message.match(new RegExp('good bot', 'i'));
  const badMatch = message.match(new RegExp('bad bot', 'i'));
  const loveMatch = message.match(new RegExp('i love you', 'i'));
  const thanksMatch = message.match(new RegExp('thanks|thank you', 'i'));

  if (goodMatch) {
    return goodReply.randomElement();

  } else if (badMatch) {
    return badReply.randomElement();

  } else if (loveMatch) {
    return loveReply.randomElement();

  } else if (thanksMatch) {
    return thanksReply.randomElement();
  }
}

Array.prototype.randomElement = function () {
  return this[Math.floor(helper.random() * this.length)]
}

module.exports = {
  "shouldReply" : shouldReply,
  "reply" : reply
}