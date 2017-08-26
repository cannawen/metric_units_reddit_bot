const helper = require('./helper');
const replier = require('./reply_maker');

function humanReply(message) {
  const body = message['body'];

  if (body.match(/good bot|bad bot|best bot/i)) {
    return replier.humanReply.randomElement();
  }

  if (body.match(/good human|good fellow human/i)) {
    return replier.goodHumanReply.randomElement();
  }

}

function inject(snippet, wholeString, match) {
  if (match) {
    return wholeString.replace(match, snippet);
  }
  if (wholeString.match("{{x}}")) {
    return wholeString.replace("{{x}}", snippet.toLowerCase());

  } else if (wholeString.match("{{X}}")) {
    return wholeString.replace("{{X}}", snippet.toUpperCase());

  } else {
    return wholeString;
  }
}

function reply(message) {
  const body = message['body'];
  const username = message['username'];

  if (body.match(/good/i) && body.match(/bad/i) && body.match(/bot/i)) {
    return replier.goodBadReply.randomElement();
  }

  const whosA = body.match(/(?:whos|who's|who is) a(n? \w+) bot/i);

  if (whosA && body.match(/you/i) === null) {
    const reply = inject(whosA[1], replier.whosAReply.randomElement());
    return inject(username, reply, "{{y}}");

  } else if (body.match(/not/i) === null && body.match(/good bot/i)) {
    return replier.goodReply.randomElement();

  } else if (body.match(/not/i) === null && body.match(/bad bot/i)) {
    return replier.badReply.randomElement();

  } else if (body.match(/i love you/i)) {
    return replier.loveReply.randomElement();

  } else if (body.match(/not/i) === null && body.match(/stupid bot|dumb bot|useless bot/i)) {
    return replier.stupidReply.randomElement();

  } else if (body.match(/no/i) === null && body.match(/thanks|thank you/i)) {
    return replier.thanksReply.randomElement();

  } else if (body.match(/good human|good fellow human/i)) {
    return replier.goodHumanReply.randomElement();

  } else if (body.match(/best bot/i)) {
    return inject(username, replier.bestBotReply.randomElement());
  
  } else if (body.match(/^what is love.?$/i)) {
    return replier.whatIsLove["What is love?"];

  } else if (body.match(/^baby,? don'?t hurt me.?$/i)) {
    return replier.whatIsLove["Baby don't hurt me"];

  } else if (body.match(/^don'?t hurt me.?$/i)) {
    return replier.whatIsLove["Don't hurt me"];

  } else if (body.match(/^no more.?$/i)) {
    return replier.whatIsLove["No more"];
  }
}

Array.prototype.randomElement = function () {
  const weightedArray = this.reduce((memo, el) => {
    if (Array.isArray(el)) {
      const additions = Array(el[0]).fill(el[1]);
      return memo.concat(additions);
    } else if(typeof el == 'string' || el instanceof String) {
      memo.push(el);
    }
    return memo;
  }, []);
  return weightedArray[Math.floor(helper.random() * weightedArray.length)];
}

module.exports = {
  "humanReply" : humanReply,
  "reply" : reply
}
