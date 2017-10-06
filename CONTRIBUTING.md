# Introduction

Thank you for your interest in contributing to metric_units reddit bot! This document is a guideline to help our community run smoothly.

# Etiquette

- Be respectful and inclusive of everyone
- Help enforce these guidelines! Please direct people towards this page if you see anything questionable
- Keep issues and PRs on-topic. Create a new issue for new topics

# Make an issue

- If you find a bug, have a question, or have a feature request, please [open an issue](https://github.com/cannawen/metric_units_reddit_bot/issues/new)
- Bug reports should contain a link to the reddit comment or reproduction steps
- Issues will be triaged by a maintainer (see "The lifecycle an issue" below)

# Contribute Code

## New to Github

If you are completely new to open source and github, you can [check out this tutorial](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github) to learn more!

## Find something to work on

- Find a [`help wanted`](https://github.com/cannawen/metric_units_reddit_bot/issues?utf8=%E2%9C%93&q=is%3Aissue%20is%3Aopen%20label%3A%22maintainer%20approved%22%20label%3A%22help%20wanted%22%20) issue and leave a comment saying you would like to work on it
- A maintainer will confirm the issue has been assigned to you, and change the tag to `in progress`
- If there are no open issues, you can come up with your own issue
- If you are working on something that you would like to submit back to the community, it **must be associated with a "maintainer approved" issue**. This is necessary for transparency, so no efforts are duplicated and there are no crazy merge conflicts

## Work on an issue

- If you are assigned an issue, you have 7 days to complete it. You may ask for an extension if you need more time, but this rule is here to ensure issues do not go "stale"
- Feel free to ask any questions on your issue thread! Also, feel free to reply to other people's questions if you know the answer or have suggestions
- You can move the [pre-commit](./pre-commit) file into your `./.git/hooks` directory, and this will run the tests every time you commit code, and ensure you don't have extra console.log statements

## Make a PR

So you have finished working on your issue, congratulations! It's time to get it merged back into the main repo.

### Required
- If you are making a PR, you must have an open issue assigned to you.
- Write "closes #{issue number}" in your PR description so the issue is linked and automatically closed upon merge
- Include a brief description of what the PR addresses
- All tests must be passing

### Optional
- You can talk about the overall architecture changes or design decisions made in the PR
- Include link to other relevant issues or PRs
- Add yourself to the contributors list (instructions below)

If you are not finished an issue but would like feedback, you can make a PR asking for reviews with `[WIP]` at the start of your PR title. Remember to remove the `[WIP]` when it is ready to be merged!

# Add yourself to the contributors list

Do you want to be included in the awesome table at the bottom of the [README](./README.md)?

- Run `npm install` if you haven't yet
- Run the following command: `npm run all-contributors add your-github-username tag1,tag2` (tags can be: code, test, doc, [and others](https://www.npmjs.com/package/all-contributors-cli))
- The script will change the `README` and `.all-contributorsrc` files and create a commit. Be sure to include it with your PR.

You can also manually edit `.all-contributorsrc` and run `npm run all-contributors generate` to update the README. See [all-contributors-cli](https://www.npmjs.com/package/all-contributors-cli) for more details

If you have contributed to the repo but are having trouble following the above instructions, just let a collaborator know that you would like to be added ([and which contribution icons you want](https://github.com/kentcdodds/all-contributors#emoji-key))!


# Collaborators

The people who are most active in the community

## Help, I've been added as a collaborator! What do??

- We appreciate the time you have taken to get to know the project, and you have been given push access to the main repository
- You are empowered to choose your own role, and be as involved (or not involved) with the project as you want
- You can (but are not limited to): answer questions, tag and approve issues, review PRs, merge PRs, do nothing, etc.
- You can update your "contribution emojis" as you take on more roles, but keep it to no more than 4 icons
- Your help in managing the community would be much appreciated, but is not required
- Use your judgement to make branches on the main repo, or push changes directly to master
- Delete remote branches once they are merged in
- Don't stress about making mistakes, 'tis only a reddit bot ¯\\\_(ツ)_/¯ (and force-pushes are disabled on master, so what's the worst that can happen...)

## How do I become a collaborator?

- Show an interest in the project by contributing to code and/or discussions

# The lifecycle of an issue

- A user submits an issue
- A collaborator reviews it, and asks any clarifying questions
- A collaborator assigns tags: `maintainer approved`, `hacktoberfest`, `discussion`, `blocked`, `duplicate`, `invalid`, `wontfix`
- If it is ready for development, help wanted` and the category of the issue (`feature`, `bug`, or `chore`) are added.
- Wait for a contributor to volunteer
- When a contributor comments that they would like to work on the issue, a collaborator will replace the `help wanted` tag with `in progress`
- Once a story is finished, the contributor should close the issue via a PR description
- If there has been no progress on the issue in 7 days, the issue should be closed and a new issue should be created to be re-assigned

# The lifecycle of a PR

- A PR is submitted by a contributor
- A maintainer reviews the PR and uses github's built-in "review changes" system to request changes
- The contributor addresses any concerns
- Repeat
- Once both parties are satisfied, the PR will be merged into master

The code is released to production a few times a week

---

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome! 
If at any point you feel like these guidelines should be changed, please open a PR against this file with the proposed changes and we can discuss it as a community