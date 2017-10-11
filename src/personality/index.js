const forEach = require('lodash.foreach');
const helper = require('../helper');
const robotPersonalities = require('./robot-personalities');
const humanPersonalities = require('./human-personalities');

const robotDictionary = {};
const humanDictionary = {};

function loadResponseConfig(path) {
  return require(path);
}

function createDictionaryEntry(personality) {
  const dictionaryEntry = Object.assign({}, personality);
  dictionaryEntry.responses = [];

  personality.responses.forEach((response) => {
    if (typeof response === 'string' || response instanceof String) {
      dictionaryEntry.responses.push(response);
    }

    else if (typeof response === 'object' || response instanceof Object) {
      for (let i = 0; i < response.weight; i++) {
        dictionaryEntry.responses.push(response.response);
      }
    }
  });

  return dictionaryEntry;
}

function initializeDictionaries() {
  robotPersonalities.forEach((personality) => {
    const responseConfig = loadResponseConfig(`./robot/${personality}`);
    robotDictionary[personality] = createDictionaryEntry(responseConfig);
  });

  humanPersonalities.forEach((personality) => {
    const responseConfig = loadResponseConfig(`./human/${personality}`);
    humanDictionary[personality] = createDictionaryEntry(responseConfig);
  });
}

/*
  This function defines the values available for replacement during postprcessing
*/
function createPostprocessMap(match, username) {
  return Object.assign(
    { username: username },
    match !== undefined && { adjective: match.toLowerCase() },
    match !== undefined && { ADJECTIVE: match.toLowerCase() }
  );
}

/*
  Helper function

  Given a "string like {{this}}" and a map like { "this" : "foobar" }
  Returns "string like foobar"
*/
function postprocess(response, match, username) {
  const map = createPostprocessMap(match[1], username);
  console.log('map', map);

  return Object.keys(map)
    .reduce((memo, key) => {
      return memo.replace(new RegExp(`{{${key}}}`, 'g'), map[key]);
    }, response);
}

function reply(dictionary, message) {
  let response;

  const body = message.body;
  const username = message.username;

  if (body.match(/no/i)) {
    return undefined;
  }

  forEach(dictionary, (phrase) => {
    let match;
    const regex = phrase.regex;

    if (typeof regex === 'function') {
      match = regex(body);
    } else {
      match = body.match(regex);
    }

    if (match) {
      const randomIndex = Math.floor(helper.random() * phrase.responses.length);
      const randomResponse = phrase.responses[randomIndex];

      response = postprocess(randomResponse, match, username);

      return false;
    }
  });

  return response;
}

function robotReply(message) {
  return reply(robotDictionary, message);
}

// This is used for sub /r/totallynotrobots where this bot pretends to be human
function humanReply(message) {
  return reply(humanDictionary, message);
}

module.exports = {
  robotDictionary: (() => robotDictionary)(),
  humanDictionary: (() => humanDictionary)(),
  initializeDictionaries: initializeDictionaries,
  humanReply: humanReply,
  robotReply: robotReply
};
