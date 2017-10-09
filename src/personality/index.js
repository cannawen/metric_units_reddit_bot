const forEach = require('lodash.foreach');
const helper = require('../helper');
const robotPersonalities = require('./robot-personalities');
const humanPersonalities = require('./human-personalities');

const robotDictionary = {};
const humanDictionary = {};

// TODO: account for weighted responses
function initializeDictionaries() {
  robotPersonalities.forEach((personality) => {
      robotDictionary[personality] = require(`./robot/${personality}`);
  });

  humanPersonalities.forEach((personality) => {
      humanDictionary[personality] = require(`./human/${personality}`);
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
  function randomElement(input) {
    if (Array.isArray(input)) {
      const weightedArray = input.reduce((memo, el) => {
        if (Array.isArray(el)) {
          const additions = Array(el[0]).fill(el[1]);
          return memo.concat(additions);
        }
        else if(typeof el == 'string' || el instanceof String) {
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

  forEach(dictionary, (phrase) => {
    let match;
    let regex = phrase['regex'];

    if (typeof regex === 'function') {
      match = regex(body);
    } else {
      match = body.match(regex);
    }

    if (match) {
      response = randomElement(phrase['responses']);

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
