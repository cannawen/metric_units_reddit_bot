What does the bot do?
---
The bot finds comments with imperial units, and replies with metric units.

It also makes snarky replies to certain triggers


How does the code work?
---
This is a javascript app built with [Node.js](https://nodejs.org/en/), and all of the app code is in directory `src`.

The app starts in `bot.js`, this file is responsible for repeatedly checking for new comments and replying to messages in an infinite loop

`converter.js` is responsible taking a message, and deciding which imperial units should be converted to which metric units (if any).

`formatter.js` takes the conversions from above, and constructs a reply to the comment

`helper.js` exists so we can easily mock external dependencies during test

`network.js` handles get, post, and OAuth network requests and parses the objects it gets back for easier consumption

`snark.js` creates snarky responses to certain trigger words


Running the code
---
Create a reddit `script` app through (your reddit preferences)[https://www.reddit.com/prefs/apps]. Use `http://localhost` as your redirect url, we don't need it. From there, you should be able to get your oauth username (line underneath `personal use script`) and secret

Create a file in directory `./private/environment.yaml` that looks like:
```
oauth-username: `your-oauth-username`
oauth-secret: `your-oauth-secret`
reddit-username: `your-username-here`
reddit-password: `your-password-here`
user-agent: script:`your-bot-name`:`your-bot-version` (by /u/`your-username-here`)
```
run `./lib/deploy.sh`


Running the tests
---
run `npm test`

Or, if you want the tests to automatically re-run when you save

run `./lib/watch.sh` (uses [fswatch](https://github.com/emcrisostomo/fswatch))


Git hooks
---
The pre-commit hook will run tests before each commit, and only allow passing code to be committed. It will also reject any code with console.log statements in them

To enable git hooks, copy the file from the `./hooks` directory into the `./.git/hooks` directory


Questions or Comments?
---
Feel free to message me :)


License
---
This source is distributed under GNU GPLv3

Pull requests or derivative works welcome
