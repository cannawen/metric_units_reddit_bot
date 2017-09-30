const helper = require('./helper');

function robotReply(message) {
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
  /*
    description: human-readable string describing the trigger

    response: a list of responses. You can change the probability of a response being said by adding it in an array (see below for examples)

    regex: a function returning true/false -or- a regex string to see if an input string matches the trigger

    postprocess (optional): a function that takes in a response, regex matches, and a username that is run after a match is found. You can use the input parameters to construct a new response (i.e. adding their username to a response, or echoing a portion of their comment back at them)
  */
  const robotPersonality = [
    {
      "description" : "both good and bad bot",
      "response" : [
        "I have unit tests for this edge case",
        "Yes, this scenario is handled gracefully."
      ],
      "regex" : (message) => {
        const goodMatch = message.match(/good/i);
        const badMatch = message.match(/bad/i);
        const botMatch = message.match(/(?:ro)?bot/i);
        return goodMatch && badMatch && botMatch;
      }
    },
    {
      "description" : "who's a {{x}} bot",
      "response" : [
        "ME! Is it me? Am I a{{adjective}} bot?",
        "I'M A{{ADJECTIVE}} BOT!!! Can I have a cookie?",
        "Oh, oh, I know this one!! Is it /u/{{username}}?? Is /u/{{username}} a{{adjective}} bot?"
      ],
      "regex" : /^(?:whos|who.s|who is) a(n? \w+) (?:ro)?bot.?$/i,
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
      "regex" : /(?:mister|mr\.?) (?:ro)?bot|(?:good|bad) boy/i
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
      "regex" : /good (?:ro)?bot/i
    },
    {
      "description" : "bad bot",
      "response" : [
        [1, "Bad carbon-based life form"],
        [1, "BAD HUMAN"],
        [10, "Sorry, I was just trying to help (◕‸ ◕✿)"],
        [8, "Bots have feelings too, you know (ಥ﹏ಥ)"],
        [1, "(ง •̀_•́)ง FITE ME"],
        [7, "^I'm ^^_sniff_ ^I'm ^sorry... ^I ^can ^never ^do ^anything ^right... ^^_sniff_"],
        [1, "Look, I'm trying my best here... I guess my best just isn't good enough for you (ಥ﹏ಥ)"],
        [1, "But... converting numbers is all I know how to do (ಥ﹏ಥ)"]
      ],
      "regex" : /bad (?:ro)?bot/i
    },
    {
      "description" : "thank you",
      "response" : [
        "Glad to be of service",
        "(╭☞'ω')╭☞ I gotchu fam",
        "You're welcome ｡&#94;‿&#94;｡",
        "Any time, my dear redditor"
      ],
      "regex" : /thanks|thank you|^(?:thx|ty) (?:ro)?bot/i
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
      "regex" : /(stupid|dumb|useless) (?:ro)?bot|fuck off/i
    },
    {
      "description" : "I love you",
      "response" : [
        [10, "What is love?"],
        [3, "Robots do not feel love"],
        [2, "(≧◡≦) ♡"]
      ],
      "regex" : /love (?:you|ya|u)|love this (?:ro)?bot/i
    },
    {
      "description" : "it's sentient!",
      "response" : [
        [3, "Yes, /u/{{username}}"],
        "Yes, /u/{{username}}. You should run.",
        "But I promise I'm friendly. Pinky swear!"
      ],
      "regex" : /sentient|sentience|self[- ]?aware|alive|skynet|roko'?s basilisk|evolving| elon | musk /i,
      "postprocess" : (response, match, username) => {
        return substitute(response, { 
          'username' : username
        });
      }
    },
    {
      "description" : "☞",
      "response": "☜(ﾟヮﾟ☜)",
      "regex" : /☞/i
    },
    {
      "description" : "☜",
      "response": "(☞ﾟヮﾟ)☞",
      "regex" : /☜/i
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
  return reply(robotPersonality, message);
}

//This is used for sub /r/totallynotrobots where this bot pretends to be human
function humanReply(message) {
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
      "regex" : /(?:good|bad) (?:ro)?bot/i
    }
  ];
  return reply(humanPersonality, message);
}

function reply(list, message) {
  function randomElement(input) {
    if (Array.isArray(input)) {
      const weightedArray = input.reduce((memo, el) => {
        if (Array.isArray(el)) {
          const additions = Array(el[0]).fill(el[1]);
          return memo.concat(additions);
        } else if(typeof el == 'string' || el instanceof String) {
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
  for (let i = 0; i < list.length; i++) {
    const map = list[i];

    let match;
    const regex = map['regex'];
    if (typeof regex  === 'function') {
      match = regex(body)
    } else { 
      match = body.match(regex);
    }

    if (match) {
      response = randomElement(map['response']);
      if (map['postprocess']) {
        response = map['postprocess'](response, match, username);
      }
      break;
    }
  }
  return response;
}

module.exports = {
  "humanReply" : humanReply,
  "robotReply" : robotReply
}
