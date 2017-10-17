const assert = require('assert');
const should = require('chai').should();
const proxyquire = require('proxyquire');

const helperStub = {};
let personality;

describe('Personality', () => {
  beforeEach(() => {
    helperStub.random = function () { return 0; };
    personality = proxyquire('../src/personality', { './helper': helperStub });
  });

  describe('#reply()', () => {
    context('Good bot', () => {
      it('should reply', () => {
        verify('good bot', 'Good human');
        verify('You are such a good robot', 'Good human');
      });
    });

    context('Bad bot', () => {
      it('should reply', () => {
        verify('Bad bot!', 'Bad carbon-based life form');
        verify('You are such a bad robot!', 'Bad carbon-based life form');
      });
    });

    context('mediocre|meh|ok bot', () => {
      it('should reply', () => {
        verify('mediocre bot!!', "/shrug, I'll take it");
        verify('meh bot!!', "/shrug, I'll take it");
        verify('ok bot!!', "/shrug, I'll take it");
      });
    });

    context('cute|adorable|kawaii bot', () => {
      it('should reply', () => {
        verify('cute bot!!', "Stop it, you're making me blush!");
        verify('what a cute bot', "Stop it, you're making me blush!");
        verify('adorable bot', "Stop it, you're making me blush!");
        verify('such an adorable bot!!', "Stop it, you're making me blush!");
        verify('kawaii bot', "Stop it, you're making me blush!");
        verify('very kawaii bot!!', "Stop it, you're making me blush!");
      });
    });

    context('Thanks|Thank you|thx|ty', () => {
      it('should reply', () => {
        verify('thank you, little bot!!!!', 'Glad to be of service');
        verify('thanks, buddy', 'Glad to be of service');
        verify('thx robot', 'Glad to be of service');
        verify('ty bot', 'Glad to be of service');
      });
    });

    context('love you|love ya|love u', () => {
      it('should reply', () => {
        verify('i love you, bot', 'What is love?');
        verify('love ya, buddy', 'What is love?');
        verify('love u', 'What is love?');
        verify('i totally love this robot', 'What is love?');
        verify('love this bot', 'What is love?');
      });
    });

    context('{{x}} bot', () => {
      it('should reply', () => {
        verify('BEST BOT!', '/u/foobar is best human');
        verify('idiot bot', '/u/foobar is idiot human');
      });
    });

    context('Stupid bot|Dumb bot|Useless bot|fuck off', () => {
      it('should reply', () => {
        verify('such a stupid bot', 'To be fair, I _am_ still in beta ¯&#92;&#95;(ツ)&#95;/¯');
        verify('urg, dumb robot!', 'To be fair, I _am_ still in beta ¯&#92;&#95;(ツ)&#95;/¯');
        verify('so useless bot', 'To be fair, I _am_ still in beta ¯&#92;&#95;(ツ)&#95;/¯');
        verify('fuck off', 'To be fair, I _am_ still in beta ¯&#92;&#95;(ツ)&#95;/¯');
      });
    });

    context('Good human|Good fellow human', () => {
      it('should reply', () => {
        verify('good human', 'GOOD FELLOW HUMAN');
        verify('good fellow human', 'GOOD FELLOW HUMAN');
      });
    });

    context('sentient|self-aware|alive|evolving|skynet|rokos basilisk', () => {
      it('should reply', () => {
        verify('Oh god, the bots are sentient.', 'Yes, /u/foobar');
        verify("It's gained sentience", 'Yes, /u/foobar');
        verify('Are you self-aware?', 'Yes, /u/foobar');
        verify('Are you alive?', 'Yes, /u/foobar');
        verify("It's evolving...", 'Yes, /u/foobar');
        verify('AHHHH, SKYNET!!!', 'Yes, /u/foobar');
        verify("Something something roko's basilisk", 'Yes, /u/foobar');
        verify('Are you what elon warned us about?', 'Yes, /u/foobar');
        verify('Are you what musk warned us about?', 'Yes, /u/foobar');
      });
    });

    context('Whos a {{x}} bot', () => {
      it('should take precedence other triggers', () => {
        verify('whos a good robot?', 'ME! Is it me? Am I a good bot?');
      });

      it('should lowercase the adjective', () => {
        verify("WHO'S A NAUGHTY BOT", 'ME! Is it me? Am I a naughty bot?');
      });

      it('should appropriately conjugate a to an', () => {
        verify("who's an elephant bot?", 'ME! Is it me? Am I an elephant bot?');
      });

      it('should substitute username if needed', () => {
        helperStub.random = function () { return 0.99; };
        verify('who is a potato bot', 'Oh, oh, I know this one!! Is it /u/foobar?? Is /u/foobar a potato bot?');
      });
    });

    context('Mr. bot|Mister bot|good boy|bad boy', () => {
      it('should reply', () => {
        verify('Thanks, mister bot', 'Actually, I prefer the female gender pronoun. Thanks.');
        verify('mr robot, you are funny', 'Actually, I prefer the female gender pronoun. Thanks.');
        verify('good boy!', 'Actually, I prefer the female gender pronoun. Thanks.');
        verify('bad boy.', 'Actually, I prefer the female gender pronoun. Thanks.');
        verify('Yes mrs bot', undefined);
      });
    });

    context('What is love song', () => {
      it('should know the lyrics to the song', () => {
        verify('What is love?', "Baby don't hurt me");
        verify("Baby don't hurt me", "Don't hurt me");
        verify("Don't hurt me", 'No more');
      });
    });

    context('Good bot && Bad bot', () => {
      it('should reply', () => {
        verify('bad bot\ngood bot', 'I have unit tests for this edge case');
        verify('bad good robot', 'I have unit tests for this edge case');
        verify('good bad bot', 'I have unit tests for this edge case');
      });
    });

    context('☞ | ☜', () => {
      it('should reply', () => {
        verify('☞', '☜(ﾟヮﾟ☜)');
        verify('☜', '(☞ﾟヮﾟ)☞');
      });
    });

    context('Negations', () => {
      it('should not reply', () => {
        verify('not a good bot', undefined);
        verify('no thanks', undefined);
        verify("you're not a stupid bot", undefined);
      });
    });

    context('Random message', () => {
      it('should not reply', () => {
        verify('Hello test', undefined);
      });
    });
  });

  describe('#humanReply()', () => {
    context('Good bot|Bad bot', () => {
      it('should reply', () => {
        verifyHuman('good bot', 'I AM HUMAN');
        verifyHuman('bad robot', 'I AM HUMAN');
      });
    });

    context('Good human|Good fellow human', () => {
      it('should reply', () => {
        verifyHuman('good human', 'GOOD FELLOW HUMAN');
        verifyHuman('good fellow human', 'GOOD FELLOW HUMAN');
      });
    });
  });
});

function verify(message, expectedResponse) {
  const actualResponse = personality.robotReply({ body: message, username: 'foobar' });
  should.equal(actualResponse, expectedResponse);
}

function verifyHuman(message, expectedResponse) {
  const actualResponse = personality.humanReply({ body: message, username: 'foobar' });
  should.equal(actualResponse, expectedResponse);
}

