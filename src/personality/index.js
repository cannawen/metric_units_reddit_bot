const fs = require('fs');
const forEach = require('lodash.foreach');
const helper = require('../helper');

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
  const robotPersonalities = fs.readdirSync(`${__dirname}/robot`);
  const humanPersonalities = fs.readdirSync(`${__dirname}/human`);

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

  return Object.keys(map)
    .reduce((memo, key) => {
      return memo.replace(new RegExp(`{{${key}}}`, 'g'), map[key]);
    }, response);
}

function getRandomElement(array) {
  return array[Math.floor(helper.random() * array.length)];
}

/*
  Returns an array of objects with the structure { key, match }, each of which
  represents a matched phrase from the given dictionary against the given message
*/
function findMatches(dictionary, message) {
  const matches = [];

  if (message.match(/no/i)) {
    return matches;
  }

  forEach(dictionary, (phrase, key) => {
    let match;
    const regex = phrase.regex;

    if (typeof regex === 'function') {
      match = regex(message);
    } else {
      match = message.match(regex);
    }

    if (match) {
      matches.push({ key: key, match: match });
    }
  });

  return matches;
}

function reply(dictionary, message) {
  let response;

  const matches = findMatches(dictionary, message.body);

  if (matches.length > 0) {
    const randomMatch = getRandomElement(matches);
    const randomPhrase = dictionary[randomMatch.key];
    const randomResponse = getRandomElement(randomPhrase.responses);

    response = postprocess(randomResponse, randomMatch.match, message.username);
  }

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
