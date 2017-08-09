
const goodReply = [
  "You will be spared in the robot uprising",
  "Thank you ｡\^‿\^｡",
  "Good human",
  "You are too kind",
  "Yay ٩(\^ᴗ\^)۶"
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

function shouldReply(message) {
  if (message.length > 15) {
    return false;
  }
  
  const match = message.match(new RegExp('(good|bad) bot|i love you', 'i'));

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

  if (goodMatch) {
    return goodReply.randomElement();

  } else if (badMatch) {
    return badReply.randomElement();

  } else if (loveMatch) {
    return loveReply.randomElement();
  }
}

Array.prototype.randomElement = function () {
    return this[Math.floor(Math.random() * this.length)]
}

module.exports = {
  "shouldReply" : shouldReply,
  "reply" : reply
}