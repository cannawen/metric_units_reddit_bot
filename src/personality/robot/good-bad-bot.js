// Responds to both "good" and "bad" bot

module.exports = {
    "regex": (message) => {
      const goodMatch = message.match(/good/i);
      const badMatch = message.match(/bad/i);
      const botMatch = message.match(/(?:ro)?bot/i);
      return goodMatch && badMatch && botMatch;
    },
    "responses" : [
      "I have unit tests for this edge case",
      "Yes, this scenario is handled gracefully."
    ]
  };
