const rh = require('./regex_helper');

const abbreviations = [
  { regexArray: [/k/, /thousand/], value: 1000 },
  { regexArray: [/m/, /mill(?:ion)?/], value: 1000000 },
  { regexArray: [/b/, /billion/], value: 1000000000 },
];

function fractionProcessor(input) {
  const frac = new RegExp(rh.fractionRegex, 'gi');
  const mixed = new RegExp(rh.numberRegex + /(?:[\s+-]+)/.source + rh.fractionRegex, 'gi');

  input = input.replace(mixed, (p1, p2, p3, p4, p5) => {
    p2 = p2.replace(/,+/g, '');
    p3 = p3.replace(/,+/g, '');
    p4 = p4.replace(/,+/g, '');
    return (parseInt(p2, 10) + (parseInt(p3, 10) / parseInt(p4, 10))).toFixed(2) + p5;
  });

  input = input.replace(frac, (p1, p2, p3, p4) => {
    p2 = p2.replace(/,+/g, '');
    p3 = p3.replace(/,+/g, '');
    return (p2 / p3).toFixed(2) + p4;
  });

  return input;
}

function abbreviationProcessor(commentBody) {
  function replaceAbbreviation(text, abbrevRegex, value) {
    const nonNumber = /[a-z]+/gi;
    const abbrev = text.match(nonNumber)[0].toLowerCase();

    if (abbrev.match(abbrevRegex)) {
      const number = text.replace(nonNumber, '');
      text = parseFloat(number) * value;
    }
    return text;
  }

  const newCommentBody = abbreviations.reduce((newCommentBody, abbreviation) => {
    const abbrevRegex = rh.regexJoinToString(abbreviation.regexArray);
    const regex = new RegExp(rh.numberRegex + '\\s?' + abbrevRegex + '\\b', 'gi');
    const { value } = abbreviation;

    return newCommentBody.replace(regex, (match) => {
      return replaceAbbreviation(match, abbrevRegex, value);
    });
  }, commentBody);

  return newCommentBody;
}

// Whenever a new preprocessing function is implemented,
// it should be added here.
const preprocessFunctions = [
  fractionProcessor,
  abbreviationProcessor,
];

function preprocessComment(comment) {
  comment.body = preprocessFunctions.reduce((processedBody, preprocessFunction) => {
    return preprocessFunction(processedBody);
  }, comment.body);

  return comment;
}

module.exports = {
  preprocessComment,
};
