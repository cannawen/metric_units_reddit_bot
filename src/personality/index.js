const fs = require('fs');
const forEach = require('lodash.foreach');
const helper = require('../helper');
const yaml = require('js-yaml');

const robotDictionary = {};
const humanDictionary = {};

function loadResponseConfig(path) {
  return yaml.safeLoad(fs.readFileSync(path, 'utf8'));
}

/*
  The js-yaml module does not like regular expressions, so we must define them as strings
  and parse them into Javascript RegExp objects
*/
function parseRegex(regexString) {
  const regexStringParts = regexString.split('/');
  const regex = regexStringParts[1];
  const flags = regexStringParts[2];

  return new RegExp(regex, flags);
}

function createDictionaryEntry(personality) {
  const dictionaryEntry = Object.assign({}, personality);
  dictionaryEntry.responses = [];
  dictionaryEntry.regex = [];

  personality.responses.forEach((response) => {
    if (helper.isString(response)) {
      dictionaryEntry.responses.push(response);
    }
    else if (helper.isObject(response)) {
      for (let i = 0; i < response.weight; i++) {
        dictionaryEntry.responses.push(response.response);
      }
    }
  });

  if (helper.isString(personality.regex)) {
    dictionaryEntry.regex = [parseRegex(personality.regex)];
  }
  else if (Array.isArray(personality.regex)) {
    dictionaryEntry.regex = personality.regex.map((regex) => parseRegex(regex));
  }

  return dictionaryEntry;
}

function initializeDictionaries() {
  const robotPersonalities = fs.readdirSync(`${__dirname}/robot`);
  const humanPersonalities = fs.readdirSync(`${__dirname}/human`);

  robotPersonalities.forEach((personality) => {
    const responseConfig = loadResponseConfig(`${__dirname}/robot/${personality}`);
    robotDictionary[personality] = createDictionaryEntry(responseConfig);
  });

  humanPersonalities.forEach((personality) => {
    const responseConfig = loadResponseConfig(`${__dirname}/human/${personality}`);
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
    match !== undefined && { ADJECTIVE: match.toUpperCase() }
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
    const match = phrase.regex.reduce((accumulator, expression) => accumulator && message.match(expression), true);

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
