const rh = require('./regex_helper');

const abbreviations = [
  { regexArray: [/k/, /thousand/], value: 1000 },
  { regexArray: [/m/, /mill(?:ion)?/], value: 1000000 },
  { regexArray: [/b/, /billion/], value: 1000000000 },
];

function fractionProcessor(input) {
  const frac = new RegExp(rh.fractionRegex, 'gi');
  const mixed = new RegExp(rh.numberRegex + /(?:[\s+-]+)/.source + rh.fractionRegex, 'gi');
  let tempInput = input;
  tempInput = tempInput.replace(mixed, (p1, p2, p3, p4, p5) => {
    const tempP2 = p2.replace(/,+/g, '');
    const tempP3 = p3.replace(/,+/g, '');
    const tempP4 = p4.replace(/,+/g, '');
    return (parseInt(tempP2, 10) + (parseInt(tempP3, 10) / parseInt(tempP4, 10))).toFixed(2) + p5;
  });

  tempInput = tempInput.replace(frac, (p1, p2, p3, p4) => {
    const tempP2 = p2.replace(/,+/g, '');
    const tempP3 = p3.replace(/,+/g, '');
    return (tempP2 / tempP3).toFixed(2) + p4;
  });

  return tempInput;
}

function abbreviationProcessor(commentBody) {
  function replaceAbbreviation(text, abbrevRegex, value) {
    const nonNumber = /[a-z]+/gi;
    const abbrev = text.match(nonNumber)[0].toLowerCase();
    let tempText = text;

    if (abbrev.match(abbrevRegex)) {
      const number = tempText.replace(nonNumber, '');
      tempText = parseFloat(number) * value;
    }
    return tempText;
  }

  const newCommentBody = abbreviations.reduce((tempNewCommentBody, abbreviation) => {
    const abbrevRegex = rh.regexJoinToString(abbreviation.regexArray);
    const regex = new RegExp(`${rh.numberRegex}\\s?${abbrevRegex}\\b`, 'gi');
    const { value } = abbreviation;

    return tempNewCommentBody.replace(regex, match =>
      replaceAbbreviation(match, abbrevRegex, value));
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
  const tempComment = comment;
  tempComment.body = preprocessFunctions.reduce((processedBody, preprocessFunction) =>
    preprocessFunction(processedBody), tempComment.body);

  return tempComment;
}

module.exports = {
  preprocessComment,
};
