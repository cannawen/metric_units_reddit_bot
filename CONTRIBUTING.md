# Contributing

Thank you for your interest in contributing to metric_units reddit bot! This document is a guideline to help our community run smoothly.

## Etiquette

- Be open and inclusive of everyone
- Help enforce these guidelines! Please direct people towards this page if you see anything questionable
- Keep issues and PRs on-topic. Create a new issue for new topics

## Making an issue

- If you find a bug, have a question, or have a feature request, please [open an issue](https://github.com/cannawen/metric_units_reddit_bot/issues/new)
- Bug reports should contain a link to the reddit comment or reproduction steps
- Issues will be triaged (see "The lifecycle of issue tags" section below)

## Coding

### New to Github

- If you are completely new to open source and github, you can [check out this tutorial](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github) to learn more!

### Finding something to work on

- You can find a ["help wanted" issue](https://github.com/cannawen/metric_units_reddit_bot/issues?utf8=%E2%9C%93&q=is%3Aissue%20is%3Aopen%20label%3A%22maintainer%20approved%22%20label%3A%22help%20wanted%22%20) and leave a comment saying you would like to work on it
- A maintainer will confirm the issue is assigned to you, and change the tag to "in progress"
- If there are no open issues, you can come up with your own issue
- If you are working on something that you would like to submit back to the community, it **must be associated with a "maintainer approved" issue**. This is necessary for transparency, so no efforts are duplicated and there are no crazy merge conflicts

### Working on an issue

- If you are assigned an issue, you have 7 days to complete it. You may ask for an extension if you need more time, but this rule is here to ensure issues do not go "stale"
- Feel free to ask any questions on your issue thread! Also, feel free to reply to other people's questions if you know the answer or have suggestions
- You can move the [pre-commit](./pre-commit) file into your `./.git/hooks` directory, and that will only allow you to commit code that are passing the tests

### Making a PR

#### Required
- If you are making a PR, you should already have an open issue assigned to you.
- Write "closes #{issue number}" in your PR description so the issue is linked and automatically closed upon merge
- Include a brief description of what the PR addresses
- All tests should be passing

#### Optional
- You can talk about the overall architecture changes or design decisions made in the PR
- Include link to other relevant issues or PRs
- Add yourself to the contributors list (instructions below)

### Adding yourself to the contributors list

Do you want to be included in the awesome table at the bottom of the [README](./README.md)?

- Run `npm install` if you haven't yet
- Run the following command: `npm run all-contributors add your-github-username tag1,tag2` (tags can be: code, test, doc, [and others](https://www.npmjs.com/package/all-contributors-cli))
- The script will change the `README` and `.all-contributorsrc` files and create a commit. Be sure to include it with your PR.

You can also manually edit `.all-contributorsrc` and run `npm run all-contributors generate` to update the README. See [all-contributors-cli](https://www.npmjs.com/package/all-contributors-cli) for more details

If you have contributed to the repo but are having trouble following the above instructions, just let a collaborator know that you would like to be added ([and which contribution icons you want](https://github.com/kentcdodds/all-contributors#emoji-key))!


## Collaborators

### Help, I've been added as a collaborator! What do??

- We appreciate the time you have taken to get to know the project, and you have been given push access to the main repository
- You can choose your own role, and be as involved (or not involved) with the project as you want. You can (but are not limited to): answer questions, tag and approve issues, review PRs, merge PRs, do nothing, etc.
- Your help in managing the community would be much appreciated (but is not required if that is something you are not interested in)
- Feel empowered to make branches on the main repo, or push changes directly to master. Use your judgement
- Delete remote branches once they are merged in
- Don't stress about making mistakes, 'tis only a reddit bot ¯\\\_(ツ)_/¯ (and force-pushes are disabled on master, so what's the worst that can happen!)

### How do I become a collaborator?

- Show an interest in the project by contributing to code and/or discussions

## The lifecycle of issue tags

- A user submits an issue
- A collaborator reviews it, and asks any clarifying questions
- A collaborator assigns one or more tags: `maintainer approved`, `hacktoberfest`, `discussion`, `duplicate`, `invalid`, `wontfix`
- If it is ready for development, a tag `help wanted` and the category of the issue (`feature`, `bug`, or `chore`) is added.
- Wait someone to volunteer to pick up the issue
- Once a volunteer is assigned an issue, the `help wanted` tag should be replaced with `in progress`
- If there has been no progress on the issue in 7 days, the issue should be closed and a new issue should be created to be re-assigned
- The contributor should close the issue via a PR description containing "closes #{issue number}"

## The lifecycle of a PR

- A PR containing the description "closes #{issue number}" is submitted by a contributor
- A maintainer reviews the PR and uses github's built-in "review changes" system to request changes
- The contributor should address any concerns
- Repeat
- Once both parties are satisfied, the PR will be merged into master

The code is released to production a few times a week

---

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome! 
If at any point you feel like these guidelines should be changed, please open a PR against this file with the proposed changes and we can discuss it as a community