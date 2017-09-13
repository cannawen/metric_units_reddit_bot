const assert = require('assert');
const should = require('chai').should();
const proxyquire =  require('proxyquire')

let helperStub = {};
let personality;

describe('Personality', () => {
  beforeEach(() => {
    helperStub.random = function () { return 0 };
    personality = proxyquire('../src/personality', { './helper': helperStub });
  });

  describe('#reply()', () => {  
    context('Good bot', () => {
      it('should reply', () => {
        verify("good bot", "Good human");
      });
    });

    context('Bad bot', () => {
      it('should reply', () => {
        verify("Bad bot!", "Bad carbon-based life form");
      });
    });

    context('Thanks|Thank you|thx|ty', () => {
      it('should reply', () => {
        verify("thank you, little bot!!!!", "Glad to be of service");
        verify("thanks, buddy", "Glad to be of service");
        verify("thx bot", "Glad to be of service");
        verify("ty bot", "Glad to be of service");
      });
    });

    context('love you|love ya|love u', () => {
      it('should reply', () => {
        verify("i love you, bot", "What is love?");
        verify("love ya, buddy", "What is love?");
        verify("love u", "What is love?");
      });      
    });

    context('{{x}} bot', () => {
      it('should reply', () => {
        verify("BEST BOT!", "/u/foobar is best human");
        verify("idiot bot", "/u/foobar is idiot human");
      });
    });

    context('Stupid bot|Dumb bot|Useless bot', () => {
      it('should reply', () => {
        verify("such a stupid bot", "To be fair, I _am_ still in beta ¯&#92;&#95;(ツ)&#95;/¯");
        verify("urg, dumb bot!", "To be fair, I _am_ still in beta ¯&#92;&#95;(ツ)&#95;/¯");
        verify("so useless bot", "To be fair, I _am_ still in beta ¯&#92;&#95;(ツ)&#95;/¯");
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
        verify("Are you self-aware?", "Yes, /u/foobar");
        verify("Are you alive?", "Yes, /u/foobar");
        verify("It's evolving...", "Yes, /u/foobar");
        verify("AHHHH, SKYNET!!!", "Yes, /u/foobar");
        verify("Something something roko's basilisk", "Yes, /u/foobar");
      });
    });

    context('Who\'s a {{x}} bot', () => {
      it('should take precedence other triggers', () => {
        verify("whos a good bot?", "ME! Is it me? Am I a good bot?");
      });
      
      it('should lowercase the adjective', () => {
        verify("WHO'S A NAUGHTY BOT", "ME! Is it me? Am I a naughty bot?");
      });

      it('should appropriately conjugate a to an', () => {        
        verify("Well, who's an elephant bot?", "ME! Is it me? Am I an elephant bot?");        
      });

      it('should substitute username if needed', () => {        
        helperStub.random = function () { return 0.99 };
        verify("who is a potato bot? Hmm?", "Oh, oh, I know this one!! Is it /u/foobar?? Is /u/foobar a potato bot?");        
      });
    });

    context('Mr. bot|Mister bot|good boy|bad boy', () => {
      it('should reply', () => {
        verify("Thanks, mister bot", "Actually, I prefer the female gender pronoun. Thanks.");
        verify("mr bot, you are funny", "Actually, I prefer the female gender pronoun. Thanks.");
        verify("good boy!", "Actually, I prefer the female gender pronoun. Thanks.");
        verify("bad boy.", "Actually, I prefer the female gender pronoun. Thanks.");
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
      it('should reply', () => {
        verify("bad bot good bot", "I have unit tests for this edge case");
        verify("bad good bot", "I have unit tests for this edge case");
        verify("good bad bot", "I have unit tests for this edge case");
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
      it('should reply', () => {
        verifyHuman("good bot", "I AM HUMAN");
        verifyHuman("bad bot", "I AM HUMAN");
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
  should.equal(actualResponse, expectedResponse);
}

function verifyHuman(message, expectedResponse) {
  const actualResponse = personality.humanReply({ 'body' : message, 'username' : 'foobar'});
  should.equal(actualResponse, expectedResponse);
}

