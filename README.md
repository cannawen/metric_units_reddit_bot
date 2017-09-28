What does the bot do?
---
The bot finds comments with imperial units, and replies with metric units. See [./test/converter-test.js](test/converter-test.js) for what conversions are currently supported, and see [Pivotal Tracker](https://www.pivotaltracker.com/n/projects/2091572) for what's coming up next.

There is a chance it will reply to certain triggers like "good bot". See [personality-test.js](test/personality-test.js) for what the triggers are.


How does the code work?
---
This is a javascript app built with [Node.js](https://nodejs.org/en/), and all of the app code is in the [src](https://github.com/cannawen/metric_units_reddit_bot/tree/master/src) directory.

The app starts in [bot.js](src/bot.js), and it polls the Reddit servers in an infinite loop. The app has two major components:

[converter.js](src/converter.js) and [conversion_helper.js](src/conversion_helper.js) are responsible for converting imperial units to metric units.

[personality.js](src/personality.js) create sassy responses to certain trigger words


Running the code (in Production)
---
Create your bot's reddit account.

Create a reddit `script` app through [your reddit preferences](https://www.reddit.com/prefs/apps). (Use `http://localhost` as your redirect url, we don't need it.) From there, you should be able to get your OAuth username and secret

Download the bot's code, and create a file `./private/environment.yaml` that looks like [sample-environment.yaml](src/sample-environment.yaml)

run `npm install` then `node ./src/bot.js` and you should have the bot up and running!

Note: The bot sometimes "skips" comments during polling. To reduce the changes of this happening when testing, you can limit the bot to look a single subreddit instead of "r/all" by changing the line `network.getRedditComments("all")` in bot.js. I recommend running it in r/test (`network.getRedditComments("test")`)!


Running the tests
---
run `npm test`

To run a single spec, add [.only](https://jaketrent.com/post/run-single-mocha-test/)


Git hooks
---
The pre-commit hook will run before each commit. It will only allow code to be committed if the following preconditions are met:
- There are no failing tests
- All tests are run (no `.only()` statements isolating tests)
- There are no unnecessary console.log statements

To enable git hooks, copy the file [pre-commit](pre-commit) into your `./.git/hooks/` directory


Questions or Comments?
---
Feel free to message me [on reddit](https://www.reddit.com/message/compose?to=cannawen&subject=metric%20units%20bot&message=I%20think%20your%20bot%20is) or [open a github issue](https://github.com/cannawen/metric_units_reddit_bot/issues/new)


Contribute
---
Metric Units Bot is participating in [Hacktoberfest](https://hacktoberfest.digitalocean.com/)! [See a list of things we need help with](https://github.com/cannawen/metric_units_reddit_bot/issues?q=is%3Aissue+is%3Aopen+label%3Ahacktoberfest) and win free T-shirts! You can also take a look at what's in [Pivotal Tracker](https://www.pivotaltracker.com/n/projects/2091572) or come up with your own improvements

Feedback & code reviews are always welcome.


License
---
This source is distributed under GNU GPLv3

Pull requests or derivative works welcome. <sup>but please don't make a freedom_units_bot just to spite me D:</sup>

