const assert = require('assert');
const should = require('chai').should();
const proxyquire =  require('proxyquire')

var helperStub   =  { };
var snark;

describe('Snark', () => {
  describe('#shouldReply()', () => {

    beforeEach(() => {
      helperStub.random = function () { return 0 };
      snark = proxyquire('../src/snark', { './helper': helperStub });
    });

    context('Good bot', () => {
      it('should reply', () => {
        snark.shouldReply("GOOD BOT!!").should.equal(true);
        snark.reply("good bot").should.equal("Good human");
      });
    });

    context('Bad bot', () => {
      it('should reply', () => {
        snark.shouldReply("bad bot...").should.equal(true);
        snark.reply("Bad bot!").should.equal("Bad carbon-based life form");
      });
    });

    context('I love you', () => {
      it('should reply', () => {
        snark.shouldReply("I love you").should.equal(true);
        snark.reply("i love you, bot").should.equal("What is love?");
      });
    });

    context('Thanks|Thank you', () => {
      it('should reply', () => {
        snark.shouldReply("thanks, bot").should.equal(true);
        snark.reply("thank you, little bot!!!!").should.equal("Glad to be of service");
      });
    });

    context('Message too long (>25 char)', () => {
      it('should not reply', () => {
        snark.shouldReply("youre a bad bot, please leave").should.equal(false);
        snark.shouldReply("You are a good bot, aren't you?").should.equal(false);
      });
    });

    context('Random message', () => {
      it('should not reply', () => {
        snark.shouldReply("Hello test").should.equal(false);
      });
    });
  });
});