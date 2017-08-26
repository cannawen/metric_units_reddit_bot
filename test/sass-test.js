const assert = require('assert');
const should = require('chai').should();
const proxyquire =  require('proxyquire')

var helperStub = {};
var sass;

function check(replyFunction, message, expectedResponse) {
  const actualResponse = replyFunction({ 'body' : message, 'username' : "foobar"});
  should.equal(actualResponse, expectedResponse);
}

describe('Sass', () => {
  beforeEach(() => {
    helperStub.random = function () { return 0 };
    sass = proxyquire('../src/sass', { './helper': helperStub });
  });

  describe('#humanReply()', () => {
    context('Good bot|Bad bot|Best bot', () => {
      it('should reply', () => {
        check(sass.humanReply, "good bot", "I AM HUMAN");
        check(sass.humanReply, "bad bot", "I AM HUMAN");
        check(sass.humanReply, "best bot", "I AM HUMAN");
      });
    });

    context('Good human|Good fellow human', () => {
      it('should reply', () => {
        check(sass.humanReply, "good human", "GOOD FELLOW HUMAN");
        check(sass.humanReply, "good fellow human", "GOOD FELLOW HUMAN");
      });
    });
  });

  describe('#reply()', () => {
    context('Good bot && Bad bot', () => {
      it('should reply', () => {
        check(sass.reply, "bad bot good bot", "I have unit tests for this edge case");
        check(sass.reply, "bad good bot", "I have unit tests for this edge case");
        check(sass.reply, "good bad bot", "I have unit tests for this edge case");
      });
    });
    
    context('Whos a {x} bot', () => {
      it('should reply', () => {
        check(sass.reply, "whos a good bot?", "ME! Is it me? Am I a good bot?");
        check(sass.reply, "who is an elephant bot?", "ME! Is it me? Am I an elephant bot?");
      });

      it('should reply not reply when user already answered', () => {
        check(sass.reply, "who's a potato bot? You are!", undefined);
      });
    });

    context('Mr. bot|Mister bot|good boy|bad boy', () => {
      it('should reply', () => {
        check(sass.reply, "Thanks, mister bot", "Actually, I prefer the female gender pronoun. Thanks.");
        check(sass.reply, "mr bot, you are funny", "Actually, I prefer the female gender pronoun. Thanks.");
        check(sass.reply, "good boy!", "Actually, I prefer the female gender pronoun. Thanks.");
        check(sass.reply, "bad boy.", "Actually, I prefer the female gender pronoun. Thanks.");
      });

      it('should reply not reply when user already answered', () => {
        check(sass.reply, "who's a potato bot? You are!", undefined);
      });
    });

    context('Good bot', () => {
      it('should reply', () => {
        check(sass.reply, "good bot", "Good human");
      });
      
      it('should handle negations', () => {
        check(sass.reply, "not a good bot", undefined);
      });
    });

    context('Bad bot', () => {
      it('should reply', () => {
        check(sass.reply, "Bad bot!", "Bad carbon-based life form");
      });

      it('should handle negations', () => {
        check(sass.reply, "not a bad bot", undefined);
      });
    });

    context('Thanks|Thank you|thx', () => {
      it('should reply', () => {
        check(sass.reply, "thank you, little bot!!!!", "Glad to be of service");
        check(sass.reply, "thanks, buddy", "Glad to be of service");
        check(sass.reply, "thx fam", "Glad to be of service");
      });

      it('should handle negations', () => {
        check(sass.reply, "no thanks", undefined);
      });
    });

    context('I love you', () => {
      it('should reply', () => {
        check(sass.reply, "i love you, bot", "What is love?");
      });
    });

    context('Best bot|Great bot', () => {
      it('should reply', () => {
        check(sass.reply, "best bot", "/u/foobar best human");
        check(sass.reply, "great bot", "/u/foobar best human");
      });

      it('should handle negations', () => {
        check(sass.reply, "not a great bot", undefined);
      });
    });

    context('Stupid bot|Dumb bot|Useless bot', () => {
      it('should reply', () => {
        check(sass.reply, "such a stupid bot", "To be fair, I _am_ still in beta ¯&#92;&#95(ツ)&#95/¯");
        check(sass.reply, "urg, dumb bot!", "To be fair, I _am_ still in beta ¯&#92;&#95(ツ)&#95/¯");
        check(sass.reply, "useless bot", "To be fair, I _am_ still in beta ¯&#92;&#95(ツ)&#95/¯");
      });

      it('should handle negations', () => {
        check(sass.reply, "you're not a stupid bot", undefined);
      });
    });

    context('Good human|Good fellow human', () => {
      it('should reply', () => {
        check(sass.reply, "good human", "GOOD FELLOW HUMAN");
        check(sass.reply, "good fellow human", "GOOD FELLOW HUMAN");
      });
    });

    context('What is love song easter egg', () => {
      it('should know the lyrics to the song', () => {
        check(sass.reply, "What is love?", "Baby don't hurt me");
        check(sass.reply, "Baby don't hurt me", "Don't hurt me");
        check(sass.reply, "Don't hurt me", "No more");
        check(sass.reply, "No more", "What is love?");
      });
    });

    context('Random message', () => {
      it('should not reply', () => {
        check(sass.reply, "Hello test", undefined);
      });
    });
  });
});
