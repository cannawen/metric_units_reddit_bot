# Contributing Guidelines

Interested in contributing to the metric_units bot? There are so many things you can do!  
- Report bugs
- Suggest features
- Answer questions
- Fix documentation
- Contribute code  

This document serves as a guideline for how to do these things

# Code of Conduct

This community will not tolerate unkind behaviour.  

[Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md) (tl;dr - don't be a [m/s^3](https://en.wikipedia.org/wiki/Jerk_(physics)))

# Etiquette

- Be friendly and inclusive of everyone
- Give and recieve constructive criticism gracefully
- Each GitHub issue should address one topic. Create new issues for new topics
- Help enforce these guidelines! Please direct people towards this page if you see anything questionable

# Introduce yourself

Say hello over at the [Contributor Introductions](https://www.reddit.com/r/metric_units/comments/750nuf/contributor_introductions/) thread! Talk to other contributors. We're a friendly bunch, we promise.

# Make an issue

- If you find a bug, have a question, or have a feature request, please [open an issue](https://github.com/cannawen/metric_units_reddit_bot/issues/new)
- Please try to search for the bug before you create a new one, to prevent duplicates!
- Bug reports should contain a link to a reddit comment or reproduction steps
- Issues will be triaged by a maintainer

# Contribute Code

It's most satifying if you contribute to an Open Source project that you care about! Please read our [vision statement](./README.md) to see if this project resonates with you.

## New to Open Source Software

Welcome! We aim to be a newbie-friendly community, so we have reserved `first timers only` issues for first-time OSS contributors.

[Click here to learn more](./NEW-TO-OSS.md).

## Find something to work on

- Find a [`help wanted`](https://github.com/cannawen/metric_units_reddit_bot/issues?utf8=%E2%9C%93&q=is%3Aissue%20is%3Aopen%20label%3A%22maintainer%20approved%22%20label%3A%22help%20wanted%22%20) issue and leave a comment saying you would like to work on it
- A maintainer will confirm the issue has been assigned to you, and change the tag to `in progress`
- If there are no open issues, you can come up with your own issue, or look in the [backlog](https://www.pivotaltracker.com/n/projects/2091572) for something that interests you
- If you are working on something that you would like to submit back to the community, it **must be associated with a "maintainer approved" issue**. This is necessary for transparency, so no efforts are duplicated and there are no crazy merge conflicts
- Issues tagged `first timers only` are reserved for those who have never made a PR to an open source community

## Work on an issue

- If you are assigned an issue, you have 7 days to complete it. You may ask for an extension if you need more time, but this rule is here to ensure issues do not go "stale"
- Feel free to ask any questions on your issue thread!

## Make a PR

So you have finished working on your issue, congratulations! It's time to get it merged back into the main repo.

### Required
- If you are making a PR, you should have a maintainer-approved issue assigned to you[1]
- Write "closes #{issue number}" in your PR description so the issue is linked and automatically closed upon merge
- Include a brief description of what the PR addresses
- All tests must be passing

[1] Exception: minor fixes (typos, etc.) do not need to have an open issue. Otherwise, if your issue is not maintainer-approved, it risks being rejected if it does not align with the community's vision :(

### Optional
- You can talk about the overall architecture changes or design decisions made in the PR
- Include link to other relevant issues or PRs
- Add yourself to the contributors list (instructions below)

If you are not finished an issue but would like feedback, you can make a PR asking for reviews with `[WIP]` at the start of your PR title. Remember to remove the `[WIP]` when it is ready to be merged!

# Add yourself to the contributors list

Do you want to be included in the awesome table at the bottom of the [README](./README.md)?

- Run `npm install` if you haven't yet
- Run the following command: `npm run all-contributors add your-github-username tag1,tag2` (tags can be: code, test, doc, [and others](https://www.npmjs.com/package/all-contributors-cli))
- The script will change the `README` and `.all-contributorsrc` files. Be sure to include these changes with your PR.

You can also manually edit `.all-contributorsrc` and run `npm run all-contributors generate` to update the README. See [all-contributors-cli](https://www.npmjs.com/package/all-contributors-cli) for more details

If you have contributed (making a bug report, feature request, fixed documentation, etc.) but are having trouble following the above instructions, just let a collaborator know that you would like to be added ([and which contribution icons you want](https://github.com/kentcdodds/all-contributors#emoji-key))!

# Collaborators

The people who are most active in the community

## Help, I've been added as a collaborator! What do??

- We appreciate the time you have taken to get to know the project, and you have been given push access to the main repository
- You are empowered to choose your own role, and be as involved (or not involved) with the project as you want
- You can (but are not limited to): answer questions, tag and approve issues, review PRs, merge PRs, do nothing, etc.
- You can update your "contribution emojis" as you take on more roles, but keep it to no more than 4 icons
- Use your judgement to make branches on the main repo, or push changes directly to master
- Delete remote branches once they are merged in
- Don't stress about making mistakes, 'tis only a reddit bot ¯\\\_(ツ)_/¯ (and force-pushes are disabled on master, so what's the worst that can happen...)  

Your help in maintaining the project & community would be much appreciated

![Please help](https://cdn-images-1.medium.com/max/803/1*Q_8HbGbbfEmAjwPqB8D60A.png)  
Let's be like Panel #1, not Panel #2 :)

## How do I become a collaborator?

Take initiative, and be an active member of the community! Some examples:  
- Suggest process improvements
- Answer questions that people ask on GitHub or on reddit
- Take on larger or more complex issues
- Write `first timers only` issues

# The lifecycle of an issue

- A user submits an issue
- A collaborator reviews it, and asks any clarifying questions
- A collaborator assigns tags: `maintainer approved`, `hacktoberfest`, `discussion`, `first timers only`, `blocked`, `duplicate`, `invalid`, `wontfix`
- Once it is ready for development `help wanted`, and the category tag (`feature`, `bug`, or `chore`) are added.
- Wait for a contributor to volunteer
- When a contributor comments that they would like to work on the issue, a collaborator will replace the `help wanted` tag with `in progress`
- Once a story is finished, the contributor should close the issue via a PR description
- If there has been no progress on the issue in 7 days, the issue should be closed and a new issue should be created to be re-assigned

# The lifecycle of a PR

- A PR is submitted by a contributor
- A maintainer reviews the PR and uses github's built-in "review changes" system to request changes
- The contributor addresses any concerns
- Repeat previous 2 steps as needed
- Once both parties are satisfied, the PR will be merged into master

The code is released to production a few times a week

# All Contributors

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome! 

--- 

If at any point you feel like these guidelines should be changed, please open a PR against this file with the proposed changes and we can discuss it as a community
