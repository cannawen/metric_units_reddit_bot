What does the bot do?
---
The bot finds comments with imperial units, and replies with metric units.

There is a chance it will reply to certain triggers like "good bot". ([See here for what the triggers are](https://github.com/cannawen/metric_units_reddit_bot/blob/master/test/personality-test.js)).

See [./test/converter-test.js](https://github.com/cannawen/metric_units_reddit_bot/blob/master/test/converter-test.js) for what conversions are currently supported, and [see Pivotal Tracker for what's coming up next](https://www.pivotaltracker.com/n/projects/2091572)


How does the code work?
---
This is a javascript app built with [Node.js](https://nodejs.org/en/), and all of the app code is in the [src](https://github.com/cannawen/metric_units_reddit_bot/tree/master/src) directory.

The app starts in `bot.js`, this file is responsible for repeatedly checking for new comments and replying to messages in an infinite loop. It uses the following modules:

`converter.js` and `units_lookup_map.js` are responsible for taking a message, and deciding which imperial units should be converted to which metric units (if any).

`reply_maker.js` constructs reply strings to comment

`helper.js` helps with mocking external dependencies in tests

`network.js` handles get, post, and OAuth network requests and parses the responses for easier consumption

`personality.js` and `personality_list.js` create sassy responses to certain trigger words

`analytics.js` will save events in the `./private` directory


Running the code
---
Create your bot's reddit account.

Create a reddit `script` app through [your reddit preferences](https://www.reddit.com/prefs/apps). (Use `http://localhost` as your redirect url, we don't need it.) From there, you should be able to get your OAuth username and secret

Download the code, and create a file `./private/environment.yaml` that looks like:
```
oauth-username: your-oauth-username
oauth-secret: your-oauth-secret
reddit-username: your-username-here
reddit-password: your-password-here
version: your-bot-version
dev-mode: false #true will print POST requests to the console, instead of actually making the POST to the server
```
run `npm install` then `node ./src/bot.js` and you should have the bot up and running!


Running the tests
---
run `npm test`


Git hooks
---
The pre-commit hook will run tests before each commit. It will only allow code to be committed if all tests are passing successfully and there are no unnecessary console.log statements.

To enable git hooks, copy the file `pre-commit` into the `./.git/hooks/` directory


Questions or Comments?
---
Feel free to message me [on reddit](https://www.reddit.com/message/compose?to=cannawen&subject=metric%20units%20bot&message=I%20think%20your%20bot%20is) or [open a github issue](https://github.com/cannawen/metric_units_reddit_bot/issues/new)


License
---
This source is distributed under GNU GPLv3

Pull requests or derivative works welcome. <sup>but please don't make an imperial_units_bot just to spite me D:</sup>

