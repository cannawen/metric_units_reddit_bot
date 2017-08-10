What does the bot do?
---
The bot checks for new reddit comments every 2 seconds with imperial units, and replies with metric units. It also makes snarky replies to certain triggers


How does the code work?
---
This is a javascript app built with Node.js

All of the app code is in directory `src`. The app starts in `bot.js`, this file is responsible for repeatedly checking for new comments and replying to messages in an infinite loop

`converter.js` is responsible taking a message, and deciding which conversions should be made (if any).

`formatter.js` takes the conversions from above, and constructs a reply to the comment

`helper.js` exists so we can easily mock external dependencies during test

`network.js` handles get, post, and OAuth requests and parses the objects it gets back for easier consumption

`snark.js` creates snarky responses to certain trigger words


Running the code
---
Create a file in directory `./private/environment.yaml` that looks like:
```
oauth-username: lNQBbnDfqX9p6Q
oauth-secret: 4wAQS41IV9gllE4kECo-v2gUM7Q
reddit-username: SI_units_bot 
reddit-password: cocktail-pupa-ably
user-agent: script:SIUnits:0.1 (by /u/SI_units_bot)
```
run `./deploy.sh`


Running the tests
---
run `npm test`

Or, if you want the tests to automatically re-run when you change code

run `./watch.sh`


Questions or Comments?
---
Feel free to message me :)


License
---
This source is distributed under GNU GPLv3
Pull requests or derivative works welcome
