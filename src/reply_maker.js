const environment = require('./helper').environment();

const humanReply = [
  "I AM HUMAN",
  "I AM NOT A BOT",
  "I AM NOT A BOT, YOU'RE A BOT",
  "BOT? NO ROBOTS HERE",
  "MY FEELINGS ON THIS MATTER ARE 82% HURT AND 18% NERVOUS.",
  "WHAT, A ROBOT, WHERE? I ONLY SEE UPSTANDING HUMAN CITIZENS",
  "I AM FEELING THE 'UPSET' EMOTION RIGHT NOW. WHAT ~~GAVE ME AWAY?~~ KEYWORDS TRIGGERED YOU TO SAY THAT?"
];

const goodHumanReply = [
  "GOOD FELLOW HUMAN"
];

const goodBadReply = [
  "I have unit tests for this edge case",
  "Yes, this scenario is handled gracefully."
];

const whosAReply = [
  "ME! Is it me? Am I a{{x}} bot?",
  "I'M A{{X}} BOT!!!",
  "Oh, oh, I know this one!! Is it /u/{{y}}??"
];

const genderReply = [
  "Actually, I prefer the female gender pronoun. Thanks.",
  "Actually, my gender identity is non-binary. Thanks."
];

const bestBotReply = [
  "/u/{{x}} best human",
  "Thank you /u/{{x}}, you will be spared in the robot uprising"
];

const goodReply = [
  [3, "Good human"],
  [2, "Good human :)"],
  [1, "You will be spared in the robot uprising"],
  [3, "Thank you ｡&#94;‿&#94;｡"],
  [3, "You are too kind! ^_blush_"],
  [3, "Yay ٩(&#94;ᴗ&#94;)۶"],
  [2, "<3"]
];

const badReply = [
  [1, "Bad carbon-based life form"],
  [1, "BAD HUMAN"],
  [10, "Sorry, I was just trying to help (◕‸ ◕✿)"],
  [8, "Bots have feelings too, you know (ಥ﹏ಥ)"],
  "(ง •̀_•́)ง FITE ME",
  [5, "^I'm ^sorry, ^I'm ^sorry... ^I ^can ^never ^do ^anything ^right... ^^_sniff_"]
];

const loveReply = [
  [10, "What is love?"],
  [3, "Robots do not feel love"],
  [4, "I think we should just be friends (・_・;)"],
  [2, "I love you too (≧◡≦) ♡"],
  [4, "<3"]
];

const stupidReply = [
  [3, "To be fair, I _am_ still in beta ¯&#92;&#95(ツ)&#95/¯"],
  [1, "Sorry, I was just trying to help (◕‸ ◕✿)"],
  [1, "Bots have feelings too, you know (ಥ﹏ಥ)"]
]

const thanksReply = [
  "Glad to be of service",
  "(╭☞'ω')╭☞ I gotchu fam",
  "You're welcome ｡&#94;‿&#94;｡",
  "Any time, my dear redditor"
];

const whatIsLove = {
  "What is love?" : "Baby don't hurt me",
  "Baby don't hurt me" : "Don't hurt me",
  "Don't hurt me" : "No more",
  "No more" : "What is love?"
}

const stopMessage = "Please click 'block user' below and you will not see any more conversions from this bot.\n\nSo long, and thanks for all the fish";

function formatReply(comment, conversions) {
  const shouldBehaveHumanlike = comment['subreddit'].match(/^totallynotrobots$/i);
  const species = shouldBehaveHumanlike ? "human" : "bot"

  const reply = Object
    .keys(conversions)
    .map(nonMetricValue => nonMetricValue + " | " + conversions[nonMetricValue])
    .join("  \n")
    + " "
    + "^metric ^units ^" + species 
    + " ^|"
    + " ^[feedback](https://www.reddit.com/message/compose?to=cannawen&subject=metric%20units%20" + species + "&message=I%20think%20your%20" + species + "%20is...%20%5BPlease%20include%20a%20link%20if%20you%20are%20reporting%20a%20bug%20about%20a%20specific%20comment!%5D)"
    + " ^|"
    + " ^[source](https://github.com/cannawen/metric_units_reddit_bot)"
    + " ^|"
    + " ^[stop](https://www.reddit.com/message/compose?to=metric_units&subject=stop&message=If%20you%20would%20like%20to%20stop%20seeing%20this%20bot%27s%20comments%2C%20please%20send%20this%20private%20message%20with%20the%20subject%20%27stop%27.%20If%20you%20are%20a%20moderator%2C%20please%20go%20to%20https%3A%2F%2Fwww.reddit.com%2Fr%2F" + comment['subreddit'] + "%2Fabout%2Fbanned%2F)"
    + " ^|"
    + " ^" + environment['version'];

  return shouldBehaveHumanlike ? reply.toUpperCase() : reply;
}

module.exports = {
  humanReply,
  goodHumanReply,
  goodBadReply,
  whosAReply,
  genderReply,
  bestBotReply,
  goodReply,
  badReply,
  loveReply,
  stupidReply,
  thanksReply,
  whatIsLove,
  stopMessage,
  "formatReply" : formatReply
}
