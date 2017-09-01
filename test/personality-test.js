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
        verify(personality.reply, "good bot", "Good human");
      });
      
      it('should handle negations', () => {
        verify(personality.reply, "not a good bot", undefined);
      });
    });

    context('Bad bot', () => {
      it('should reply', () => {
        verify(personality.reply, "Bad bot!", "Bad carbon-based life form");
      });

      it('should handle negations', () => {
        verify(personality.reply, "not a bad bot", undefined);
      });
    });

    context('Thanks|Thank you|thx|ty', () => {
      it('should reply', () => {
        verify(personality.reply, "thank you, little bot!!!!", "Glad to be of service");
        verify(personality.reply, "thanks, buddy", "Glad to be of service");
        verify(personality.reply, "thx bot", "Glad to be of service");
        verify(personality.reply, "ty bot", "Glad to be of service");
      });

      it('should handle negations', () => {
        verify(personality.reply, "no thanks", undefined);
      });
    });

    context('love you|love ya|love u', () => {
      it('should reply', () => {
        verify(personality.reply, "i love you, bot", "What is love?");
        verify(personality.reply, "love ya, buddy", "What is love?");
        verify(personality.reply, "love u", "What is love?");
      });      

      it('should handle negations', () => {
        verify(personality.reply, "no one love you", undefined);
      });
    });

    context('{{x}} bot', () => {
      it('should reply', () => {
        verify(personality.reply, "BEST BOT!", "/u/foobar is best human");
        verify(personality.reply, "idiot bot", "/u/foobar is idiot human");
      });
    });

    context('Stupid bot|Dumb bot|Useless bot', () => {
      it('should reply', () => {
        verify(personality.reply, "such a stupid bot", "To be fair, I _am_ still in beta ¯&#92;&#95;(ツ)&#95;/¯");
        verify(personality.reply, "urg, dumb bot!", "To be fair, I _am_ still in beta ¯&#92;&#95;(ツ)&#95;/¯");
        verify(personality.reply, "so useless bot", "To be fair, I _am_ still in beta ¯&#92;&#95;(ツ)&#95;/¯");
      });

      it('should handle negations', () => {
        verify(personality.reply, "you're not a stupid bot", undefined);
      });
    });

    context('Good human|Good fellow human', () => {
      it('should reply', () => {
        verify(personality.reply, "good human", "GOOD FELLOW HUMAN");
        verify(personality.reply, "good fellow human", "GOOD FELLOW HUMAN");
      });
    });

    context('sentient|self-aware|alive', () => {
      it('should reply', () => {
        verify(personality.reply, "Oh god, the bots are sentient.", "Yes, /u/foobar");
        verify(personality.reply, "Are you self-aware?", "Yes, /u/foobar");
        verify(personality.reply, "Are you alive?", "Yes, /u/foobar");
      });
    });

    context('Who\'s a {{x}} bot', () => {
      it('should take precedence other triggers', () => {
        verify(personality.reply, "whos a good bot?", "ME! Is it me? Am I a good bot?");
      });
      
      it('should lowercase the adjective', () => {
        verify(personality.reply, "WHO'S A NAUGHTY BOT", "ME! Is it me? Am I a naughty bot?");
      });

      it('should appropriately conjugate a to an', () => {        
        verify(personality.reply, "Well, who's an elephant bot?", "ME! Is it me? Am I an elephant bot?");        
      });

      it('should substitute username if needed', () => {        
        helperStub.random = function () { return 0.99 };
        verify(personality.reply, "who is a potato bot? Hmm?", "Oh, oh, I know this one!! Is it /u/foobar?? Is /u/foobar a potato bot?");        
      });

      it('should not reply when user already answered', () => {
        verify(personality.reply, "who's a tasty bot? You are!", undefined);
      });
    });

    context('Mr. bot|Mister bot|good boy|bad boy', () => {
      it('should reply', () => {
        verify(personality.reply, "Thanks, mister bot", "Actually, I prefer the female gender pronoun. Thanks.");
        verify(personality.reply, "mr bot, you are funny", "Actually, I prefer the female gender pronoun. Thanks.");
        verify(personality.reply, "good boy!", "Actually, I prefer the female gender pronoun. Thanks.");
        verify(personality.reply, "bad boy.", "Actually, I prefer the female gender pronoun. Thanks.");
      });
    });

    context('What is love song', () => {
      it('should know the lyrics to the song', () => {
        verify(personality.reply, "What is love?", "Baby don't hurt me");
        verify(personality.reply, "Baby don't hurt me", "Don't hurt me");
        verify(personality.reply, "Don't hurt me", "No more");
        verify(personality.reply, "No more", "What is love?");
      });
    });
    
    context('Good bot && Bad bot', () => {
      it('should reply', () => {
        verify(personality.reply, "bad bot good bot", "I have unit tests for this edge case");
        verify(personality.reply, "bad good bot", "I have unit tests for this edge case");
        verify(personality.reply, "good bad bot", "I have unit tests for this edge case");
      });
    });

    context('Random message', () => {
      it('should not reply', () => {
        verify(personality.reply, "Hello test", undefined);
      });
    });
  });

  describe('#humanReply()', () => {
    context('Good bot|Bad bot|Best bot', () => {
      it('should reply', () => {
        verify(personality.humanReply, "good bot", "I AM HUMAN");
        verify(personality.humanReply, "bad bot", "I AM HUMAN");
        verify(personality.humanReply, "best bot", "I AM HUMAN");
      });
    });

    context('Good human|Good fellow human', () => {
      it('should reply', () => {
        verify(personality.humanReply, "good human", "GOOD FELLOW HUMAN");
        verify(personality.humanReply, "good fellow human", "GOOD FELLOW HUMAN");
      });
    });
  });
});

function verify(replyFunction, message, expectedResponse) {
  const actualResponse = replyFunction({ 'body' : message, 'username' : 'foobar'});
  should.equal(actualResponse, expectedResponse);
}

