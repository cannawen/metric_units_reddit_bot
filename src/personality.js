const helper = require('./helper');
const personalityList = require('./personality_list');

function humanReply(message) {
  return reply(personalityList.humanPersonality, message);

}

function robotReply(message) {
  return reply(personalityList.robotPersonality, message);
}

function reply(list, message) {
  function randomElement(input) {
    if (Array.isArray(input)) {
      const weightedArray = input.reduce((memo, el) => {
        if (Array.isArray(el)) {
          const additions = Array(el[0]).fill(el[1]);
          return memo.concat(additions);
        } else if(typeof el == 'string' || el instanceof String) {
          memo.push(el);
        }
        return memo;
      }, []);
      return weightedArray[Math.floor(helper.random() * weightedArray.length)];
    } else {
      return input;
    }
  }

  const body = message['body'];
  const username = message['username'];

  if (body.match(/no/i)) {
    return undefined;
  }
  
  let response = undefined;
  for (let i = 0; i < list.length; i++) {
    const map = list[i];
    const match = body.match(map['regex']);
    if (match) {
      response = randomElement(map['response']);
      if (map['postprocess']) {
        response = map['postprocess'](response, match, username);
      }
      break;
    }
  }
  return response;
}

module.exports = {
  "humanReply" : humanReply,
  "robotReply" : robotReply
}
