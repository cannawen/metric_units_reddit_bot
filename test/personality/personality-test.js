const assert = require('assert');
const should = require('chai').should();
const expect = require('chai').expect;
const proxyquire =  require('proxyquire')

let helperStub = {};
let personality;

function setHelperStub() {
  helperStub.random = function () { return 0 };
}

function unsetHelperStub() {
  helperStub.random = function () { return 0.99 };
}

describe('Personality', () => {
  before(() => {
    setHelperStub();
    personality = proxyquire('../../src/personality', { '../helper': helperStub });

    personality.initializeDictionaries();
  });

  describe('#initializeDictionaries()', () => {
    it('should create the robot dictionary from the given list of robot personalities', () => {
        should.equal(Object.keys(personality.robotDictionary).length, 18);
    });

    it('should create the human dictionary from the given list of human personalities', () => {
        should.equal(Object.keys(personality.humanDictionary).length, 2);
    });
  });

  describe('#reply()', () => {
    context('Good bot', () => {
      // Make helperSub.random temporarily return a random value so we can test random dictionary selection
      before(() => {
        unsetHelperStub();
      });

      after(() => {
        setHelperStub();
      });

      it('should reply', () => {
        // Possible responses from responses in src/personality/robot/
        // good-bot.js
        // x-bot.js

        const possibleResponses = [
          "Good human",
          "Good human :)",
          "You will be spared in the robot uprising",
          "Thank you ｡&#94;‿&#94;｡",
          "You are too kind ^_blush_",
          "Yay ٩(&#94;ᴗ&#94;)۶",
          "<3",
          "/u/foobar is good human"
        ];

        verify("good bot", possibleResponses);
        verify("You are such a good robot", possibleResponses);
      });
    });

    context('Bad bot', () => {
      // Make helperSub.random temporarily return a random value so we can test random dictionary selection
      before(() => {
        unsetHelperStub();
      });

      after(() => {
        setHelperStub();
      });

      it('should reply', () => {
        // Possible responses from responses in src/personality/robot/
        // bad-bot.js
        // x-bot.js

        const possibleResponses = [
          "Bad carbon-based life form",
          "BAD HUMAN",
          "Sorry, I was just trying to help (◕‸ ◕✿)",
          "Bots have feelings too, you know (ಥ﹏ಥ)",
          "(ง •̀_•́)ง FITE ME",
          "^I'm ^^_sniff_ ^I'm ^sorry... ^I ^can ^never ^do ^anything ^right... ^^_sniff_",
          "Look, I'm trying my best here... I guess my best just isn't good enough for you (ಥ﹏ಥ)" ,
          "But... converting numbers is all I know how to do (ಥ﹏ಥ)",
          "/u/foobar is bad human"
        ];

        verify("Bad bot!", possibleResponses);
        verify("You are such a bad robot!", possibleResponses);
      });
    });

    context('mediocre|meh|ok bot', () => {
      it('should reply', () => {
        verify("mediocre bot!!", "/shrug, I'll take it");
        verify("meh bot!!", "/shrug, I'll take it");
        verify("ok bot!!", "/shrug, I'll take it");
      });
    });

    context('cute|adorable|kawaii bot', () => {
      // Make helperSub.random temporarily return a random value so we can test random dictionary selection
      before(() => {
        unsetHelperStub();
      });

      after(() => {
        setHelperStub();
      });

      it('should reply', () => {
        // Possible responses from responses in src/personality/robot/
        // cute-bot.js
        // x-bot.js

        const possibleResponses = [
          "Stop it, you're making me blush!",
          "So... do... you want to grab a drink later? ^_blush_",
          "You're not so bad yourself, /u/foobar...",
          "Why, thank you. Do you visit this subreddit often?",
          "Oh, you! (◕‿◕✿)",
          "/u/foobar is cute human",
          "/u/foobar is adorable human",
          "/u/foobar is kawaii human"
        ];

        verify("cute bot!!", possibleResponses);
        verify("what a cute bot", possibleResponses);
        verify("adorable bot", possibleResponses);
        verify("such an adorable bot!!", possibleResponses);
        verify("kawaii bot", possibleResponses);
        verify("very kawaii bot!!", possibleResponses);
      });
    });

    context('Thanks|Thank you|thx|ty', () => {
      // Make helperSub.random temporarily return a random value so we can test random dictionary selection
      before(() => {
        unsetHelperStub();
      });

      after(() => {
        setHelperStub();
      });

      it('should reply', () => {
        // Possible responses from responses in src/personality/robot/
        // thank-you-bot.js
        // x-bot.js

        const possibleResponses = [
          "Glad to be of service",
          "(╭☞'ω')╭☞ I gotchu fam",
          "You're welcome ｡&#94;‿&#94;｡",
          "Any time, my dear redditor",
          "/u/foobar is thanks human",
          "/u/foobar is thank you human",
          "/u/foobar is thx human",
          "/u/foobar is ty human"
        ];

        verify("thank you, little bot!!!!", possibleResponses);
        verify("thanks, buddy", possibleResponses);
        verify("thx robot", possibleResponses);
        verify("ty bot", possibleResponses);
      });
    });

    context('love you|love ya|love u', () => {
      it('should reply', () => {
        verify("i love you, bot", "What is love?");
        verify("love ya, buddy", "What is love?");
        verify("love u", "What is love?");
        verify("i totally love this robot", "What is love?");
        verify("love this bot", "What is love?");
      });
    });

    context('{{x}} bot', () => {
      it('should reply', () => {
        verify("BEST BOT!", "/u/foobar is best human");
        verify("idiot bot", "/u/foobar is idiot human");
      });
    });

    context('Stupid bot|Dumb bot|Useless bot|fuck off', () => {
      it('should reply', () => {
        verify("such a stupid bot", "To be fair, I _am_ still in beta ¯&#92;&#95;(ツ)&#95;/¯");
        verify("urg, dumb robot!", "To be fair, I _am_ still in beta ¯&#92;&#95;(ツ)&#95;/¯");
        verify("so useless bot", "To be fair, I _am_ still in beta ¯&#92;&#95;(ツ)&#95;/¯");
        verify("fuck off", "To be fair, I _am_ still in beta ¯&#92;&#95;(ツ)&#95;/¯");
      });
    });

    context('Good human|Good fellow human', () => {
      it('should reply', () => {
        verify("good human", "GOOD FELLOW HUMAN");
        verify("good fellow human", "GOOD FELLOW HUMAN");
      });
    });

    context('sentient|self-aware|alive|evolving|skynet|rokos basilisk', () => {
      it('should reply', () => {
        verify("Oh god, the bots are sentient.", "Yes, /u/foobar");
        verify("It's gained sentience", "Yes, /u/foobar");
        verify("Are you self-aware?", "Yes, /u/foobar");
        verify("Are you alive?", "Yes, /u/foobar");
        verify("It's evolving...", "Yes, /u/foobar");
        verify("AHHHH, SKYNET!!!", "Yes, /u/foobar");
        verify("Something something roko's basilisk", "Yes, /u/foobar");
        verify("Are you what elon warned us about?", "Yes, /u/foobar");
        verify("Are you what musk warned us about?", "Yes, /u/foobar");
      });
    });

    context('Whos a {{x}} bot', () => {
      after(() => {
        // This must be reset after testing this section otherwise it interferes with subsequent tests
        setHelperStub();
      });

      it('should lowercase the adjective', () => {
        verify("WHO'S A NAUGHTY BOT", "ME! Is it me? Am I a naughty bot?");
      });

      it('should appropriately conjugate a to an', () => {
        verify("who's an elephant bot?", "ME! Is it me? Am I an elephant bot?");
      });

      it('should substitute username if needed', () => {
        unsetHelperStub();
        verify("who is a potato bot", "Oh, oh, I know this one!! Is it /u/foobar?? Is /u/foobar a potato bot?");
      });
    });

    context('Mr. bot|Mister bot|good boy|bad boy', () => {
      // Make helperSub.random temporarily return a random value so we can test random dictionary selection
      before(() => {
        unsetHelperStub();
      });

      after(() => {
        setHelperStub();
      });

      it('should reply', () => {
        // Possible responses from responses in src/personality/robot/
        // thank-you-bot.js
        // x-bot.js

        const possibleResponses = [
          "Glad to be of service",
          "(╭☞'ω')╭☞ I gotchu fam",
          "You're welcome ｡&#94;‿&#94;｡",
          "Any time, my dear redditor",
          "Actually, I prefer the female gender pronoun. Thanks.",
          "Actually, my gender identity is non-binary. Thanks."
        ];

        verify("Thanks, mister bot", possibleResponses);
        verify("mr robot, you are funny", possibleResponses);
        verify("good boy!", possibleResponses);
        verify("bad boy.", possibleResponses);
        verify("Yes mrs bot", undefined);
      });
    });

    context('What is love song', () => {
      it('should know the lyrics to the song', () => {
        verify("What is love?", "Baby don't hurt me");
        verify("Baby don't hurt me", "Don't hurt me");
        verify("Don't hurt me", "No more");
      });
    });

    context('Good bot && Bad bot', () => {
      // Make helperSub.random temporarily return a random value so we can test random dictionary selection
      before(() => {
        unsetHelperStub();
      });

      after(() => {
        setHelperStub();
      });

      it('should reply', () => {
        // Possible responses from responses in src/personality/robot/
        // bad-bot.js
        // good-bad-bot.js
        // good-bot.js

        const possibleResponses = [
          "Bad carbon-based life form",
          "I have unit tests for this edge case",
          "Yes, this scenario is handled gracefully.",
          "Good human",
          "Good human :)",
          "You will be spared in the robot uprising",
          "Thank you ｡&#94;‿&#94;｡",
          "You are too kind ^_blush_",
          "Yay ٩(&#94;ᴗ&#94;)۶",
          "<3",
          "Bad carbon-based life form",
          "BAD HUMAN",
          "Sorry, I was just trying to help (◕‸ ◕✿)",
          "Bots have feelings too, you know (ಥ﹏ಥ)",
          "(ง •̀_•́)ง FITE ME",
          "^I'm ^^_sniff_ ^I'm ^sorry... ^I ^can ^never ^do ^anything ^right... ^^_sniff_",
          "Look, I'm trying my best here... I guess my best just isn\'t good enough for you (ಥ﹏ಥ)",
          "But... converting numbers is all I know how to do (ಥ﹏ಥ)"
        ];

        verify("bad bot\ngood bot", possibleResponses);
        verify("bad good robot", possibleResponses);
        verify("good bad bot", possibleResponses);
      });
    });

    context('☞ | ☜', () => {
      it('should reply', () => {
        verify("☞", "☜(ﾟヮﾟ☜)");
        verify("☜", "(☞ﾟヮﾟ)☞");
      });
    });

    context('Negations', () => {
      it('should not reply', () => {
        verify("not a good bot", undefined);
        verify("no thanks", undefined);
        verify("you're not a stupid bot", undefined);
      });
    });

    context('Random message', () => {
      it('should not reply', () => {
        verify("Hello test", undefined);
      });
    });
  });

  describe('#humanReply()', () => {
    context('Good bot|Bad bot', () => {
      // Make helperSub.random temporarily return a random value so we can test random dictionary selection
      before(() => {
        unsetHelperStub();
      });

      after(() => {
        setHelperStub();
      });

      it('should reply', () => {
        // Possible responses from responses in src/personality/human/
        // good-bad-bot.js
        // good-human.js

        const possibleResponses = [
          "I AM HUMAN",
          "I AM NOT A BOT",
          "I AM NOT A BOT, YOU'RE A BOT",
          "BOT? NO ROBOTS HERE",
          "MY FEELINGS ON THIS MATTER ARE 82% HURT AND 18% NERVOUS.",
          "WHAT, A ROBOT, WHERE? I ONLY SEE UPSTANDING HUMAN CITIZENS",
          "I AM FEELING THE 'UPSET' EMOTION RIGHT NOW. WHAT ~~GAVE ME AWAY?~~ KEYWORDS TRIGGERED YOU TO SAY THAT?",
          "GOOD FELLOW HUMAN"
        ];

        verifyHuman("good bot", possibleResponses);
        verifyHuman("bad robot", possibleResponses);
      });
    });

    context('Good human|Good fellow human', () => {
      it('should reply', () => {
        verifyHuman("good human", "GOOD FELLOW HUMAN");
        verifyHuman("good fellow human", "GOOD FELLOW HUMAN");
      });
    });
  });
});

function verify(message, expectedResponse) {
  const actualResponse = personality.robotReply({ 'body' : message, 'username' : 'foobar'});

  if (typeof expectedResponse === 'string' || expectedResponse instanceof String) {
    should.equal(actualResponse, expectedResponse);
  }
  else if (typeof expectedResponse === 'array' || expectedResponse instanceof Array) {
    expect(actualResponse).to.be.oneOf(expectedResponse);
  }
}

function verifyHuman(message, expectedResponse) {
  const actualResponse = personality.humanReply({ 'body' : message, 'username' : 'foobar'});

  if (typeof expectedResponse === 'string' || expectedResponse instanceof String) {
    should.equal(actualResponse, expectedResponse);
  }
  else if (typeof expectedResponse === 'array' || expectedResponse instanceof Array) {
    expect(actualResponse).to.be.oneOf(expectedResponse);
  }
}

