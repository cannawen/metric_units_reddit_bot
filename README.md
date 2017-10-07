![Build status](https://travis-ci.org/cannawen/metric_units_reddit_bot.svg?branch=master)

[![first-timers-only](http://img.shields.io/badge/first--timers--only-friendly-blue.svg)](http://www.firsttimersonly.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![All Contributors](https://img.shields.io/badge/all_contributors-18-orange.svg?style=flat-square)](#contributors)
[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](./LICENSE.txt)

# Vision

- To [convert imperial units into metric](./test/converter-test.js)
- To surprise and delight with [unexpected sassy responses](./test/personality-test.js)
- To [encourage newbies to participate in open source](./NEW-TO-OSS.md)

# How does the code work?

This is a javascript app built with [Node.js](https://nodejs.org/en/), and all of the app code is in the [src](./src) directory.

The app starts in [bot.js](./src/bot.js), and it polls the Reddit servers in an infinite loop. The app has two major components:

[converter.js](./src/converter.js) and [conversion_helper.js](./src/conversion_helper.js) are responsible for converting imperial units to metric units.

[personality.js](./src/personality.js) create sassy responses to certain trigger words


# Running the code

For changes not related to networking, running tests is often enough.  
But if you want to see the bot hitting the Reddit servers:

1. Create your bot's reddit account.
2. Create a reddit `script` app through [your reddit preferences](https://www.reddit.com/prefs/apps). (Use `http://localhost` as your redirect url, we don't need it.) 
3. Get your OAuth username (random characters below "personal use script") and secret
4. Fork the main github repo and download the bot's code from your own repo
5. Create a file `./private/environment.yaml` that looks like [sample-environment.yaml](./sample-environment.yaml)
6. ensure your `node --version` is >= v6.2.1
7. run `npm install`
8. run `node ./src/bot.js`
9. You should have the bot up and running!

Note: You can run the bot in development mode (which won't POST requests to reddit servers) by changing the `dev-mode` environment variable to `true`


# Running the tests

You do not need to create a reddit app to run the tests, you can use the [sample-environment.yaml](./sample-environment.yaml) default values.

run `npm test`

Note: To run a single spec, add [.only](https://jaketrent.com/post/run-single-mocha-test/)


# Questions or Comments?

Feel free to [drop by the subreddit](https://www.reddit.com/r/metric_units/) or [open a github issue](../../issues/new)


# Contribute

See [Contributing Guideline](./CONTRIBUTING.md) and [Code of Conduct](./CODE_OF_CONDUCT.md) 

First time getting involved in Open Source Software? Welcome, and we hope you stick around!  
See [New to OSS guide](./NEW-TO-OSS.md)  

Thanks goes to these wonderful people who have contributed ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
| [<img src="https://avatars1.githubusercontent.com/u/1088336?v=4" width="100px;"/><br /><sub>Canna Wen</sub>](https://www.cannawen.com)<br />[💻](https://github.com/cannawen/metric_units_reddit_bot/commits?author=cannawen "Code") [💬](#question-cannawen "Answering Questions") [🤔](#ideas-cannawen "Ideas, Planning, & Feedback") [👀](#review-cannawen "Reviewed Pull Requests") | [<img src="https://avatars2.githubusercontent.com/u/7432848?v=4" width="100px;"/><br /><sub>Daniel Albert</sub>](https://esclear.de/)<br />[💻](https://github.com/cannawen/metric_units_reddit_bot/commits?author=esclear "Code") | [<img src="https://avatars0.githubusercontent.com/u/38579?v=4" width="100px;"/><br /><sub>Bob Clingan</sub>](http://www.bobclingan.com)<br />[💻](https://github.com/cannawen/metric_units_reddit_bot/commits?author=bclingan "Code") | [<img src="https://avatars3.githubusercontent.com/u/7226476?v=4" width="100px;"/><br /><sub>fbontin</sub>](http://fbontin.github.io)<br />[💻](https://github.com/cannawen/metric_units_reddit_bot/commits?author=fbontin "Code") | [<img src="https://avatars2.githubusercontent.com/u/16208882?v=4" width="100px;"/><br /><sub>Nitin Choudhary</sub>](http://www.nitinchoudhary.in)<br />[💻](https://github.com/cannawen/metric_units_reddit_bot/commits?author=nitinkgp23 "Code") | [<img src="https://avatars0.githubusercontent.com/u/7240098?v=4" width="100px;"/><br /><sub>Manuel Porto</sub>](https://github.com/manuporto)<br />[💻](https://github.com/cannawen/metric_units_reddit_bot/commits?author=manuporto "Code") | [<img src="https://avatars1.githubusercontent.com/u/6846913?v=4" width="100px;"/><br /><sub>Anna Do</sub>](https://twitter.com/annuhdo)<br />[💻](https://github.com/cannawen/metric_units_reddit_bot/commits?author=annuhdo "Code") |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| [<img src="https://avatars1.githubusercontent.com/u/3136972?v=4" width="100px;"/><br /><sub>Charles</sub>](http://charleslabas.com/)<br />[💻](https://github.com/cannawen/metric_units_reddit_bot/commits?author=chazzlabs "Code") [💬](#question-chazzlabs "Answering Questions") [🤔](#ideas-chazzlabs "Ideas, Planning, & Feedback") | [<img src="https://avatars2.githubusercontent.com/u/9531780?v=4" width="100px;"/><br /><sub>Hasan</sub>](https://github.com/JuanPotato)<br />[💻](https://github.com/cannawen/metric_units_reddit_bot/commits?author=JuanPotato "Code") | [<img src="https://avatars1.githubusercontent.com/u/20388195?v=4" width="100px;"/><br /><sub>Marc Fogleman</sub>](http://www.MFogleman.com)<br />[💻](https://github.com/cannawen/metric_units_reddit_bot/commits?author=MFogleman "Code") | [<img src="https://avatars2.githubusercontent.com/u/5065375?v=4" width="100px;"/><br /><sub>Eliot Wong</sub>](https://github.com/eliotw)<br />[💻](https://github.com/cannawen/metric_units_reddit_bot/commits?author=eliotw "Code") | [<img src="https://avatars0.githubusercontent.com/u/12798396?v=4" width="100px;"/><br /><sub>Doomki</sub>](https://github.com/Doomki)<br />[💻](https://github.com/cannawen/metric_units_reddit_bot/commits?author=Doomki "Code") | [<img src="https://avatars1.githubusercontent.com/u/381258?v=4" width="100px;"/><br /><sub>Wing Lian</sub>](https://twitter.com/winglian)<br />[💻](https://github.com/cannawen/metric_units_reddit_bot/commits?author=winglian "Code") | [<img src="https://avatars1.githubusercontent.com/u/19378450?v=4" width="100px;"/><br /><sub>NFerraro</sub>](https://github.com/nicoferraro96)<br />[💻](https://github.com/cannawen/metric_units_reddit_bot/commits?author=nicoferraro96 "Code") |
| [<img src="https://avatars3.githubusercontent.com/u/6984346?v=4" width="100px;"/><br /><sub>Nalin Bhardwaj</sub>](http://nibnalin.me)<br />[💻](https://github.com/cannawen/metric_units_reddit_bot/commits?author=nalinbhardwaj "Code") [💬](#question-nalinbhardwaj "Answering Questions") | [<img src="https://avatars3.githubusercontent.com/u/20612753?v=4" width="100px;"/><br /><sub>thepassenger-hub</sub>](https://github.com/thepassenger-hub)<br />[💻](https://github.com/cannawen/metric_units_reddit_bot/commits?author=thepassenger-hub "Code") | [<img src="https://avatars0.githubusercontent.com/u/132009?v=4" width="100px;"/><br /><sub>Sean Grimes</sub>](https://github.com/munumafia)<br />[💻](https://github.com/cannawen/metric_units_reddit_bot/commits?author=munumafia "Code") | [<img src="https://avatars2.githubusercontent.com/u/89664?v=4" width="100px;"/><br /><sub>Rafal Dittwald</sub>](http://rafal.dittwald.com)<br />[📖](https://github.com/cannawen/metric_units_reddit_bot/commits?author=rafd "Documentation") |
<!-- ALL-CONTRIBUTORS-LIST:END -->

# All contributions welcome

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!


# License

This source is distributed under [GNU GPLv3](./LICENSE.txt)
