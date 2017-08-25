const assert = require('assert');
const should = require('chai').should();
const proxyquire =  require('proxyquire')

var helperStub = {};
var snark;

function check(replyFunction, message, expectedResponse) {
  const actualResponse = replyFunction({ 'body' : message, 'username' : "foobar"});
  should.equal(actualResponse, expectedResponse);
}

describe('Snark', () => {
  beforeEach(() => {
    helperStub.random = function () { return 0 };
    snark = proxyquire('../src/snark', { './helper': helperStub });
  });

  describe('#humanReply()', () => {
    context('Good bot || Bad bot', () => {
      it('should reply', () => {
        check(snark.humanReply, "good bot", "I AM HUMAN");
        check(snark.humanReply, "bad bot", "I AM HUMAN");
      });
    });

    context('Good human || Good fellow human', () => {
      it('should reply', () => {
        check(snark.humanReply, "good human", "GOOD FELLOW HUMAN");
        check(snark.humanReply, "good fellow human", "GOOD FELLOW HUMAN");
      });
    });
  });

  describe('#reply()', () => {
    context('Good bot && Bad bot', () => {
      it('should reply', () => {
        check(snark.reply, "bad bot good bot", "I think you might be a bit confused");
      });
    });
    
    context('Whos a {x} bot', () => {
      it('should reply', () => {
        check(snark.reply, "who's a potato bot?", "ME! Is it me? Am I a potato bot?");
        check(snark.reply, "who is an elephant bot?", "ME! Is it me? Am I an elephant bot?");
        check(snark.reply, "whos a good bot?", "ME! Is it me? Am I a good bot?");
      });
    });

    context('Good bot', () => {
      it('should reply', () => {
        check(snark.reply, "good bot", "Good human");
      });
    });

    context('Bad bot', () => {
      it('should reply', () => {
        check(snark.reply, "Bad bot!", "Bad carbon-based life form");
      });
    });

    context('Thanks|Thank you', () => {
      it('should reply', () => {
        check(snark.reply, "thank you, little bot!!!!", "Glad to be of service");
        check(snark.reply, "thanks, buddy", "Glad to be of service");
      });
    });

    context('I love you', () => {
      it('should reply', () => {
        check(snark.reply, "i love you, bot", "What is love?");
      });
    });

    context('Best bot', () => {
      it('should reply', () => {
        check(snark.reply, "best bot", "/u/foobar best human");
      });
    });

    context('Stupid bot|Dumb bot|Useless bot', () => {
      it('should reply', () => {
        check(snark.reply, "such a stupid bot", "To be fair, I _am_ still in beta ¯&#92;&#95(ツ)&#95/¯");
        check(snark.reply, "urg, dumb bot!", "To be fair, I _am_ still in beta ¯&#92;&#95(ツ)&#95/¯");
        check(snark.reply, "useless bot", "To be fair, I _am_ still in beta ¯&#92;&#95(ツ)&#95/¯");
      });
    });

    context('Good human || Good fellow human', () => {
      it('should reply', () => {
        check(snark.reply, "good human", "GOOD FELLOW HUMAN");
        check(snark.reply, "good fellow human", "GOOD FELLOW HUMAN");
      });
    });

    context('What is love song easter egg', () => {
      it('should know the lyrics to the song', () => {
        check(snark.reply, "What is love?", "Baby don't hurt me");
        check(snark.reply, "Baby don't hurt me", "Don't hurt me");
        check(snark.reply, "Don't hurt me", "No more");
        check(snark.reply, "No more", "What is love?");
      });
    });

    context('Random message', () => {
      it('should not reply', () => {
        check(snark.reply, "Hello test", undefined);
      });
    });
  });
});
