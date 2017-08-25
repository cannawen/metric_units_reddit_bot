const assert = require('assert');
const should = require('chai').should();
const proxyquire =  require('proxyquire')

var helperStub = {};
var snark;

describe('Snark', () => {
  beforeEach(() => {
    helperStub.random = function () { return 0 };
    snark = proxyquire('../src/snark', { './helper': helperStub });
  });

  describe('#humanReply()', () => {
    context('Good bot || Bad bot', () => {
      it('should reply', () => {
        snark.humanReply("good bot").should.equal("I AM HUMAN");
        snark.humanReply("bad bot").should.equal("I AM HUMAN");
      });
    });

    context('Good human || Good fellow human', () => {
      it('should reply', () => {
        snark.humanReply("good human").should.equal("GOOD FELLOW HUMAN");
        snark.humanReply("good fellow human").should.equal("GOOD FELLOW HUMAN");
      });
    });
  });

  describe('#reply()', () => {
    context('Good bot && Bad bot', () => {
      it('should reply', () => {
        snark.reply("bad bot good bot").should.equal("I think you might be a bit confused");
      });
    });
    
    context('Whos a {x} bot', () => {
      it('should reply', () => {
        snark.reply("who's a potato bot?").should.equal("ME! Is it me? Am I a potato bot?");
        snark.reply("who is an elephant bot?").should.equal("ME! Is it me? Am I an elephant bot?");
        snark.reply("whos a good bot?").should.equal("ME! Is it me? Am I a good bot?");
      });
    });

    context('Good bot', () => {
      it('should reply', () => {
        snark.reply("good bot").should.equal("Good human");
      });
    });

    context('Bad bot', () => {
      it('should reply', () => {
        snark.reply("Bad bot!").should.equal("Bad carbon-based life form");
      });
    });

    context('Thanks|Thank you', () => {
      it('should reply', () => {
        snark.reply("thank you, little bot!!!!").should.equal("Glad to be of service");
        snark.reply("thanks, buddy").should.equal("Glad to be of service");
      });
    });

    context('I love you', () => {
      it('should reply', () => {
        snark.reply("i love you, bot").should.equal("What is love?");
      });
    });

    context('Stupid bot|Dumb bot|Useless bot', () => {
      it('should reply', () => {
        snark.reply("such a stupid bot").should.equal("To be fair, I _am_ still in beta ¯&#92;&#95(ツ)&#95/¯");
        snark.reply("urg, dumb bot!").should.equal("To be fair, I _am_ still in beta ¯&#92;&#95(ツ)&#95/¯");
        snark.reply("useless bot").should.equal("To be fair, I _am_ still in beta ¯&#92;&#95(ツ)&#95/¯");
      });
    });

    context('Good human || Good fellow human', () => {
      it('should reply', () => {
        snark.humanReply("good human").should.equal("GOOD FELLOW HUMAN");
        snark.humanReply("good fellow human").should.equal("GOOD FELLOW HUMAN");
      });
    });

    context('What is love song easter egg', () => {
      it('should know the lyrics to the song', () => {
        snark.reply("What is love?").should.equal("Baby don't hurt me");
        snark.reply("Baby don't hurt me").should.equal("Don't hurt me");
        snark.reply("Don't hurt me").should.equal("No more");
        snark.reply("No more").should.equal("What is love?");
      });
    });

    context('Random message', () => {
      it('should not reply', () => {
        should.equal(snark.reply("Hello test"), undefined);
      });
    });
  });
});
