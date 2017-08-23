const assert = require('assert');
const should = require('chai').should();
const proxyquire =  require('proxyquire')

var helperStub   =  { };
var snark;

describe('Snark', () => {
  describe('#reply()', () => {

    beforeEach(() => {
      helperStub.random = function () { return 0 };
      snark = proxyquire('../src/snark', { './helper': helperStub });
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
      });
    });

    context('I love you', () => {
      it('should reply', () => {
        snark.reply("i love you, bot").should.equal("What is love?");
      });
    });

    context('Stupid bot', () => {
      it('should reply', () => {
        snark.reply("such a stupid bot").should.equal("To be fair, I am still in beta ¯&#92;&#95(ツ)&#95/¯");
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
