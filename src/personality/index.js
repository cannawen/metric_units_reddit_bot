const forEach = require('lodash.foreach');
const helper = require('../helper');
const robotPersonalities = require('./robot-personalities');
const humanPersonalities = require('./human-personalities');

const robotDictionary = {};
const humanDictionary = {};

function createDictionaryEntry(personality) {
  const newPersonality = Object.assign({}, personality);
  newPersonality.responses = [];

  personality.responses.forEach((response) => {
    if (typeof response === 'string' || response instanceof String) {
      newPersonality.responses.push(response);
    }
    else if (typeof response === 'object' || response instanceof Object) {
      for(let i = 0; i < response.weight; i++) {
        newPersonality.responses.push(response.response);
      }
    }
  });

  return newPersonality;
}

function initializeDictionaries() {
  robotPersonalities.forEach((personality) => {
    robotDictionary[personality] = createDictionaryEntry(require(`./robot/${personality}`));
  });

  humanPersonalities.forEach((personality) => {
    humanDictionary[personality] = createDictionaryEntry(require(`./human/${personality}`));
  });
}

// TODO: Address the need to pass the substitute function
/*
  Helper function

  Given a "string like {{this}}" and a map like { "this" : "foobar" }
  Returns "string like foobar"
*/
function substitute(wholeString, map) {
  return Object.keys(map)
    .reduce((memo, key) => {
      return memo.replace(new RegExp("{{" + key + "}}", 'g'), map[key]);
    }, wholeString);
}

function robotReply(message) {
  return reply(robotDictionary, message);
}

//This is used for sub /r/totallynotrobots where this bot pretends to be human
function humanReply(message) {
  return reply(humanDictionary, message);
}

function reply(dictionary, message) {
  const body = message['body'];
  const username = message['username'];

  if (body.match(/no/i)) {
    return undefined;
  }

  let response = undefined;

  forEach(dictionary, (phrase) => {
    let match;
    let regex = phrase['regex'];

    if (typeof regex === 'function') {
      match = regex(body);
    } else {
      match = body.match(regex);
    }

    if (match) {
      const responses = phrase['responses'];

      const randomIndex = Math.floor(helper.random() * responses.length)
      response = responses[randomIndex];

      if (phrase['postprocess']) {
        response = phrase['postprocess'](response, match, username, substitute);
      }

      return false;
    }
  });

  return response;
}

module.exports = {
  "initializeDictionaries": initializeDictionaries,
  "robotDictionary": (() => robotDictionary)(),
  "humanDictionary": (() => humanDictionary)(),
  "humanReply" : humanReply,
  "robotReply" : robotReply
};
