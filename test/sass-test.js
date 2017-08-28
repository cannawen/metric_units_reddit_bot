const assert = require('assert');
const should = require('chai').should();
const proxyquire =  require('proxyquire')

let helperStub = {};
let sass;

describe('Sass', () => {
  beforeEach(() => {
    helperStub.random = function () { return 0 };
    sass = proxyquire('../src/sass', { './helper': helperStub });
  });

  describe('#reply()', () => {    
    context('Good bot', () => {
      it('should reply', () => {
        verify(sass.reply, "good bot", "Good human");
      });
      
      it('should handle negations', () => {
        verify(sass.reply, "not a good bot", undefined);
      });
    });

    context('Bad bot', () => {
      it('should reply', () => {
        verify(sass.reply, "Bad bot!", "Bad carbon-based life form");
      });

      it('should handle negations', () => {
        verify(sass.reply, "not a bad bot", undefined);
      });
    });

    context('Thanks|Thank you|thx', () => {
      it('should reply', () => {
        verify(sass.reply, "thank you, little bot!!!!", "Glad to be of service");
        verify(sass.reply, "thanks, buddy", "Glad to be of service");
        verify(sass.reply, "thx fam", "Glad to be of service");
      });

      it('should handle negations', () => {
        verify(sass.reply, "no thanks", undefined);
      });
    });

    context('love you|love ya|love u', () => {
      it('should reply', () => {
        verify(sass.reply, "i love you, bot", "What is love?");
        verify(sass.reply, "love ya, buddy", "What is love?");
        verify(sass.reply, "love u", "What is love?");
      });      

      it('should handle negations', () => {
        verify(sass.reply, "no one love you", undefined);
      });
    });

    context('{{x}} bot', () => {
      it('should reply', () => {
        verify(sass.reply, "BEST BOT!", "/u/foobar best human");
        verify(sass.reply, "idiot bot", "/u/foobar idiot human");
      });
    });

    context('Stupid bot|Dumb bot|Useless bot', () => {
      it('should reply', () => {
        verify(sass.reply, "such a stupid bot", "To be fair, I _am_ still in beta ¯&#92;&#95;(ツ)&#95;/¯");
        verify(sass.reply, "urg, dumb bot!", "To be fair, I _am_ still in beta ¯&#92;&#95;(ツ)&#95;/¯");
        verify(sass.reply, "so useless bot", "To be fair, I _am_ still in beta ¯&#92;&#95;(ツ)&#95;/¯");
      });

      it('should handle negations', () => {
        verify(sass.reply, "you're not a stupid bot", undefined);
      });
    });

    context('Good human|Good fellow human', () => {
      it('should reply', () => {
        verify(sass.reply, "good human", "GOOD FELLOW HUMAN");
        verify(sass.reply, "good fellow human", "GOOD FELLOW HUMAN");
      });
    });

    context('sentient|self-aware|alive', () => {
      it('should reply', () => {
        verify(sass.reply, "Oh god, the bots are sentient.", "Yes, /u/foobar");
        verify(sass.reply, "Are you self-aware?", "Yes, /u/foobar");
        verify(sass.reply, "Are you alive?", "Yes, /u/foobar");
      });
    });

    context('Whos a {{x}} bot', () => {
      it('should superceeding other triggers', () => {
        verify(sass.reply, "whos a good bot?", "ME! Is it me? Am I a good bot?");
      });
      
      it('should lowercase the adjective', () => {
        verify(sass.reply, "WHO'S A NAUGHTY BOT", "ME! Is it me? Am I a naughty bot?");
      });

      it('should appropriately conjugate the a to an', () => {        
        verify(sass.reply, "Well, who's an elephant bot?", "ME! Is it me? Am I an elephant bot?");        
      });

      it('should substitute username if needed', () => {        
        helperStub.random = function () { return 0.99 };
        verify(sass.reply, "who is a potato bot? Hmm?", "Oh, oh, I know this one!! Is it /u/foobar?? Is /u/foobar a potato bot?");        
      });

      it('should not reply when user already answered', () => {
        verify(sass.reply, "who's a tasty bot? You are!", undefined);
      });
    });

    context('Mr. bot|Mister bot|good boy|bad boy', () => {
      it('should reply', () => {
        verify(sass.reply, "Thanks, mister bot", "Actually, I prefer the female gender pronoun. Thanks.");
        verify(sass.reply, "mr bot, you are funny", "Actually, I prefer the female gender pronoun. Thanks.");
        verify(sass.reply, "good boy!", "Actually, I prefer the female gender pronoun. Thanks.");
        verify(sass.reply, "bad boy.", "Actually, I prefer the female gender pronoun. Thanks.");
      });
    });

    context('What is love song', () => {
      it('should know the lyrics to the song', () => {
        verify(sass.reply, "What is love?", "Baby don't hurt me");
        verify(sass.reply, "Baby don't hurt me", "Don't hurt me");
        verify(sass.reply, "Don't hurt me", "No more");
        verify(sass.reply, "No more", "What is love?");
      });
    });
    
    context('Good bot && Bad bot', () => {
      it('should reply', () => {
        verify(sass.reply, "bad bot good bot", "I have unit tests for this edge case");
        verify(sass.reply, "bad good bot", "I have unit tests for this edge case");
        verify(sass.reply, "good bad bot", "I have unit tests for this edge case");
      });
    });

    context('Random message', () => {
      it('should not reply', () => {
        verify(sass.reply, "Hello test", undefined);
      });
    });
  });

  describe('#humanReply()', () => {
    context('Good bot|Bad bot|Best bot', () => {
      it('should reply', () => {
        verify(sass.humanReply, "good bot", "I AM HUMAN");
        verify(sass.humanReply, "bad bot", "I AM HUMAN");
        verify(sass.humanReply, "best bot", "I AM HUMAN");
      });
    });

    context('Good human|Good fellow human', () => {
      it('should reply', () => {
        verify(sass.humanReply, "good human", "GOOD FELLOW HUMAN");
        verify(sass.humanReply, "good fellow human", "GOOD FELLOW HUMAN");
      });
    });
  });
});

function verify(replyFunction, message, expectedResponse) {
  const actualResponse = replyFunction({ 'body' : message, 'username' : 'foobar'});
  should.equal(actualResponse, expectedResponse);
}

