function substitute(wholeString, map) {
  return Object.keys(map)
    .reduce((memo, key) => {
      return memo.replace(new RegExp("{{" + key + "}}", 'g'), map[key]);
    }, wholeString);
}

const humanPersonality = [
  {
    "description" : "good human",
    "response" : "GOOD FELLOW HUMAN",
    "regex" : /good(?: fellow)? human/i
  },
  {
    "description" : "good/bad bot",
    "response" : [
      "I AM HUMAN",
      "I AM NOT A BOT",
      "I AM NOT A BOT, YOU'RE A BOT",
      "BOT? NO ROBOTS HERE",
      "MY FEELINGS ON THIS MATTER ARE 82% HURT AND 18% NERVOUS.",
      "WHAT, A ROBOT, WHERE? I ONLY SEE UPSTANDING HUMAN CITIZENS",
      "I AM FEELING THE 'UPSET' EMOTION RIGHT NOW. WHAT ~~GAVE ME AWAY?~~ KEYWORDS TRIGGERED YOU TO SAY THAT?"
    ],
    "regex" : /good bot|bad bot/i
  }
];

const robotPersonality = [
  {
    "description" : "both good and bad bot",
    "response" : [
      "I have unit tests for this edge case",
      "Yes, this scenario is handled gracefully."
    ],
    "regex" : /good bot bad bot|bad bot good bot|bad good bot|good bad bot/i
  },
  {
    "description" : "who's a {{x}} bot",
    "response" : [
      "ME! Is it me? Am I a{{adjective}} bot?",
      "I'M A{{ADJECTIVE}} BOT!!! Can I have a cookie?",
      "Oh, oh, I know this one!! Is it /u/{{username}}?? Is /u/{{username}} a{{adjective}} bot?"
    ],
    "regex" : /(?:whos|who's|who is) a(n? \w+) bot/i,
    "postprocess" : (response, match, username) => {
      return substitute(response, {
        'adjective' : match[1].toLowerCase(),
        'ADJECTIVE' : match[1].toUpperCase(),
        'username' : username
      });
    }
  },
  {
    "description" : "mr. bot",
    "response" : [
      [3, "Actually, I prefer the female gender pronoun. Thanks."],
      "Actually, my gender identity is non-binary. Thanks."
    ],
    "regex" : /mr.? bot|mister bot|good boy|bad boy/i
  },
  {
    "description" : "good human",
    "response" : "GOOD FELLOW HUMAN",
    "regex" : /good(?: fellow)? human/i
  },
  {
    "description" : "good bot",
    "response" : [
      [3, "Good human"],
      [2, "Good human :)"],
      [1, "You will be spared in the robot uprising"],
      [3, "Thank you ｡&#94;‿&#94;｡"],
      [3, "You are too kind ^_blush_"],
      [3, "Yay ٩(&#94;ᴗ&#94;)۶"],
      [1, "<3"]
    ],
    "regex" : /good bot/i
  },
  {
    "description" : "bad bot",
    "response" : [
      [1, "Bad carbon-based life form"],
      [1, "BAD HUMAN"],
      [10, "Sorry, I was just trying to help (◕‸ ◕✿)"],
      [8, "Bots have feelings too, you know (ಥ﹏ಥ)"],
      "(ง •̀_•́)ง FITE ME",
      [7, "^I'm ^^_sniff_ ^I'm ^sorry... ^I ^can ^never ^do ^anything ^right... ^^_sniff_"]
    ],
    "regex" : /bad bot/i
  },
  {
    "description" : "thank you",
    "response" : [
      "Glad to be of service",
      "(╭☞'ω')╭☞ I gotchu fam",
      "You're welcome ｡&#94;‿&#94;｡",
      "Any time, my dear redditor"
    ],
    "regex" : /thanks|thank you|^(?:thx|ty) bot/i
  },
  {
    "description" : "{{x}} bot",
    "response" : "/u/{{username}} is {{adjective}} human",
    "regex" : /^(\w+) bot.?$/i,
    "postprocess" : (response, match, username) => {
      return substitute(response, { 
        'username' : username,
        'adjective' : match[1].toLowerCase()
      });
    }
  },
  {
    "description" : "stupid bot",
    "response" : [
      [3, "To be fair, I _am_ still in beta ¯&#92;&#95;(ツ)&#95;/¯"],
      [1, "Sorry, I was just trying to help (◕‸ ◕✿)"],
      [1, "Bots have feelings too, you know (ಥ﹏ಥ)"]
    ],
    "regex" : /(stupid|dumb|useless) bot/i
  },
  {
    "description" : "I love you",
    "response" : [
      [10, "What is love?"],
      [3, "Robots do not feel love"],
      [2, "(≧◡≦) ♡"]
    ],
    "regex" : /love (?:you|ya|u)/i
  },
  {
    "description" : "it's sentient!",
    "response" : [
      [3, "Yes, /u/{{username}}"],
      "Yes, /u/{{username}}. You should run.",
      "But I promise I'm friendly"
    ],
    "regex" : /sentient|self[- ]?aware|alive|skynet|roko'?s basilisk|evolving/i,
    "postprocess" : (response, match, username) => {
      return substitute(response, { 
        'username' : username
      });
    }
  },
  {
    "description" : "What is love?",
    "response": "Baby don't hurt me",
    "regex" : /^what is love.?$/i
  },
  {
    "description" : "Baby don't hurt me",
    "response":  "Don't hurt me",
    "regex" : /^baby,? don'?t hurt me.?$/i
  },
  {
    "description" : "Don't hurt me",
    "response":  "No more",
    "regex" : /^don'?t hurt me.?$/i
  }
];

module.exports = {
  humanPersonality,
  robotPersonality
}
