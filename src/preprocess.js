const rh = require('./regex_helper');

const abbreviations = [
  { regexArray: [/k/, /thousand/], value: 1000 },
  { regexArray: [/m/, /mill(?:ion)?/], value: 1000000 },
  { regexArray: [/b/, /billion/], value: 1000000000 },
];

function fractionProcessor(input) {
  const frac = new RegExp(rh.fractionRegex, 'gi');
  const mixed = new RegExp(rh.numberRegex + /(?:[\s+-]+)/.source + rh.fractionRegex, 'gi');
  let output = input;

  output = output.replace(
    mixed,
    (p1, p2, p3, p4, p5) => (parseInt(p2.replace(/,+/g, ''), 10) + (parseInt(p3.replace(/,+/g, ''), 10) / parseInt(p4.replace(/,+/g, ''), 10))).toFixed(2) + p5,
  );

  output = output.replace(
    frac,
    (p1, p2, p3, p4) => (p2.replace(/,+/g, '') / p3.replace(/,+/g, '')).toFixed(2) + p4,
  );

  return output;
}

function abbreviationProcessor(commentBody) {
  function replaceAbbreviation(text, abbrevRegex, value) {
    let inputText = text;
    const nonNumber = /[a-z]+/gi;
    const abbrev = inputText.match(nonNumber)[0].toLowerCase();

    if (abbrev.match(abbrevRegex)) {
      const number = inputText.replace(nonNumber, '');
      inputText = parseFloat(number) * value;
    }
    return inputText;
  }

  return abbreviations.reduce((newCommentBody, abbreviation) => {
    const abbrevRegex = rh.regexJoinToString(abbreviation.regexArray);
    const regex = new RegExp(`${rh.numberRegex}\\s?${abbrevRegex}\\b`, 'gi');
    const { value } = abbreviation;

    return newCommentBody.replace(regex, match => replaceAbbreviation(match, abbrevRegex, value));
  }, commentBody);
}

// Whenever a new preprocessing function is implemented,
// it should be added here.
const preprocessFunctions = [
  fractionProcessor,
  abbreviationProcessor,
];

function preprocessComment(comment) {
  const inputComment = comment;
  inputComment.body = preprocessFunctions.reduce(
    (processedBody, preprocessFunction) => preprocessFunction(processedBody),
    comment.body,
  );
  return inputComment;
}

module.exports = {
  preprocessComment,
};
