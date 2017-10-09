// Responds to "who's a {{x}} bot"

module.exports = {
    "regex" : /^(?:whos|who.s|who is) a(n? \w+) (?:ro)?bot.?$/i,
    "responses" : [
      "ME! Is it me? Am I a{{adjective}} bot?",
      "I'M A{{ADJECTIVE}} BOT!!! Can I have a cookie?",
      "Oh, oh, I know this one!! Is it /u/{{username}}?? Is /u/{{username}} a{{adjective}} bot?"
    ],
    "postprocess" : (response, match, username, substitute) => {
      return substitute(response, {
        'adjective' : match[1].toLowerCase(),
        'ADJECTIVE' : match[1].toUpperCase(),
        'username' : username
      });
    }
  };
