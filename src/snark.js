const helper = require('./helper');

const goodReply = [
  [5, "Good human"],
  [1, "You will be spared in the robot uprising"],
  [3, "Thank you ｡&#94;‿&#94;｡"],
  [3, "You are too kind"],
  [3, "Yay ٩(&#94;ᴗ&#94;)۶"]
];

const badReply = [
  [1, "Bad carbon-based life form"],
  [3, "To be fair, I am still in beta ¯\\\_(ツ)\_/¯"],
  [1, "Bad human"],
  [1, "BAD HUMAN"],
  [8, "Sorry, I was just trying to help (◕‸ ◕✿)"],
  [6, "Bots have feelings too, you know (ಥ﹏ಥ)"]
];

const loveReply = [
  [10, "What is love?"],
  [3, "Robots do not feel love"],
  [5, "I think we should just be friends (・_・;)"],
  [2, "I love you too (≧◡≦) ♡"]
];

const thanksReply = [
  "Glad to be of service",
  "(╭☞'ω')╭☞ I gotchu fam",
  "You're welcome ｡&#94;‿&#94;｡",
  "Any time, my dear redditor"
];

function reply(message) {
  const goodMatch = message.match(/good bot/i);
  const badMatch = message.match(/bad bot/i);

  if (goodMatch && badMatch) {
    return "I think you might be a bit confused";
  }

  if (goodMatch) {
    return goodReply.randomElement();

  } else if (badMatch) {
    return badReply.randomElement();

  } else if (message.match(/thanks|thank you/i)) {
    return thanksReply.randomElement();

  } else if (message.match(/i love you/i)) {
    return loveReply.randomElement();

  } else if (message.match(/^what is love.?$/i)) {
    return "Baby don't hurt me";

  } else if (message.match(/^baby,? don'?t hurt me.?$/i)) {
    return "Don't hurt me";

  } else if (message.match(/^don'?t hurt me.?$/i)) {
    return "No more";
  
  } else if (message.match(/^no more.?$/i)) {
    return "What is love?";
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
  "reply" : reply
}
