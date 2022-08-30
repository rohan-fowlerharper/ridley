# Alerter Reserver

## High level overview:

When the Help Desk online gets very busy, we'd like to call in people who are in reserve (those who are on red/yellow on the roster, or other teachers who are available). With this, reserves can completely ignore the `#help-desk` and listen only for the `#reserves` channel so that they can focus on non-floor-related work.

Based on [Teaching Task Issue #82](https://github.com/dev-academy-programme/teaching-tasks/issues/82) we'd like to call in reserves when a message meets this criteria:

- There has been an un-answered call for help in `#help-desk` for some amount of time
- There are x or more unanswered `#help-desk` requests

## Current setup

This repo describes a Discord bot to achieve this by:

- Storing an list of unresolved messages in memory (for each cohort's help desk), where each message has three states: `unresolved`, `sentToLocal`, and `resolved`
- Listening for new messages in `#help-desk` and adds it to the unresolved messages
- Listening for reactions in `#help-desk` and `#reserve-alerts`, if an unresolved message receives a reaction, it's considered resolved

The unresolved messages are checked every 30 seconds and unresolved messages are sent to the `#reserve-alerts` channel if:

- It has been unresolved for 7 or more minutes
- There are 3 or more unresolved messages being stored

When sent, people with the `@reserves` role are tagged with some information about the help request, the message's status is changed to `sentToLocal`.

Teachers typically use emojis to communicate whether or not they have opted to help a student, and so any emojis added _or removed_ to `#help-desk` messages that have _already_ been sent to the `#reserve-alerts` channel are reflected there, and vice versa.

**NOTE:** [Issue #2](https://github.com/enspiral-dev-academy/reserves-script/issues/2) describes a feature request to send help requests that have sat unresolved in the `#reserve-alerts` channel (when things are _really_ busy), which will introduce a forth state to messages: `sentToGlobal`

## Commands

- `/reserves list`: lists all people with the `@reserves` role
- `/reserves toggle`: toggles the `@reserves` role for yourself
- `/reserves join`: adds the `@reserves` role for yourself
- `/reserves leave`: removes the `@reserves` role for yourself

## Where the bot runs

Currently the bot runs on a Heroku worker dyno on [Rohan's](https://github.com/rohan-fowlerharper) account. It's not terribly difficult to transfer to anyone else who would like to deploy the bot. However, it should be noted that it only needs to run in one place at a time.

## Roadmap

The Roadmap for this project can be briefly summarised by the small number of [issues for the project.](https://github.com/enspiral-dev-academy/reserves-script/issues)

However, there are indeed some important decisions that need to be made for the bot regarding an official name!
