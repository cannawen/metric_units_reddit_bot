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
  [2, "Bad human"],
  [8, "Sorry, I was just trying to help (◕‸ ◕✿)"],
  [6, "Bots have feelings too, you know (ಥ﹏ಥ)"]
];

const loveReply = [
  [8, "What is love?"],
  [1, "I don't think we are at that stage of our relationship yet"],
  [4, "I think we should just be friends"],
  [2, "I love you too <3"]
];

const thanksReply = [
  "Glad to be of service",
  "(╭☞'ω')╭☞ I gotchu",
  "You're welcome ｡&#94;‿&#94;｡",
  "Any time, my dear redditor"
];

let snarked = {};

function shouldReply(message) {
  const now = helper.now();

  function cleanupOldSnarked() {
    snarked = Object.keys(snarked).reduce((memo, key) => {
      const yesterday = now - 24*60*60*1000;
      if (snarked[key] > yesterday) {
        memo[key] = now;
      }
      return memo;
    }, {});
  };

  cleanupOldSnarked();

  if (message.length > 25) {
    return false;
  }

  const match = message.match(new RegExp('good bot|bad bot|i love you|thanks|thank you', 'i'));
  const postTitle = message['submission'];

  if (match && snarked[postTitle] === undefined) {
    snarked[postTitle] = now;
    return true;

  } else if (match && helper.random() > 0.6) {
    return true;
  } else {
    return false
  }
}

function reply(message) {
  const goodMatch = message.match(new RegExp('good bot', 'i'));
  const badMatch = message.match(new RegExp('bad bot', 'i'));
  const loveMatch = message.match(new RegExp('i love you', 'i'));
  const thanksMatch = message.match(new RegExp('thanks|thank you', 'i'));

  if (goodMatch && badMatch) {
    return "I think you might be a bit confused";
  }

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
  const weightedArray = this.reduce((memo, el) => {
    if (Array.isArray(el)) {
      const additions = Array(el[0]).fill(el[1]);
      return memo.concat(additions);;
    } else if(typeof el == 'string' || el instanceof String) {
      memo.push(el)
    }
    return memo;
  }, []);
  return weightedArray[Math.floor(helper.random() * weightedArray.length)]
}

module.exports = {
  "shouldReply" : shouldReply,
  "reply" : reply
}