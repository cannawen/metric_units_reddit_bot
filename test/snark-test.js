const assert = require('assert');
const should = require('chai').should();

const snark = require('../src/snark');

describe('Snark', () => {
  describe('#shouldReply()', () => {

    context('Good bot', () => {
      it('should reply', () => {
        snark.shouldReply("Good bot").should.equal(true);
        snark.shouldReply("good bot").should.equal(true);
        snark.shouldReply("Good bot!").should.equal(true);
        snark.shouldReply("good bot.").should.equal(true);
      });
    });

    context('Bad bot', () => {
      it('should reply', () => {
        snark.shouldReply("Bad bot").should.equal(true);
        snark.shouldReply("bad bot").should.equal(true);
        snark.shouldReply("Bad bot.").should.equal(true);
        snark.shouldReply("Bad bot!").should.equal(true);
      });
    });

    context('I love you', () => {
      it('should reply', () => {
        snark.shouldReply("I love you").should.equal(true);
      });
    });

    context('Both good and bad bot', () => {
      it('should not reply', () => {
        snark.shouldReply("Good bot Bad bot").should.equal(false);
      });
    });

    context('Message too long (>15 char)', () => {
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