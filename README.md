# Alerter Reserver

This repo is very new but on a high-level:

When the Help Desk online gets very busy, we'd like to call in people who are in reserve (those who are on red/yellow on the roster, or other teachers who are available)

Based on [Teaching Task Issue #82](https://github.com/dev-academy-programme/teaching-tasks/issues/82) we'd like to call in reserves when a message meets this criteria:

- There has been an un-answered call for help in `#help-desk` for some amount of time
- There are x or more unanswered `#help-desk` requests

This repo describes a Discord bot to achieve this by:

- Storing an array of unresolved messages in memory
- Listening for reactions in `#help-desk`, if an unresolved message receives a reaction, it's considered resolved and removed from the array
- Listening for new messages in `#help-desk` and adds it to the unresolved message array

The unresolved messages are checked at the following times:

- When a reaction is added in `#help-desk`
- When a new message is created in `#help-desk`
- (Optionally) Every x amount of time

When checked, if an unresolved message meets the criteria, a message is sent to a different channel (currently, `#reserve-alerts`) and all people with the `@reserves` role is tagged

## Commands

- Typing `/reserves` in `#reserve-alerts` will toggle the `@reserves` role for yourself

## Roadmap

- Deploy this to Heroku so it's not running ephemerally from my laptop 🥴
- Add the ability to add multiple reserve and help desk channels
- Load time thresholds from environment variables so they can be edited on the fly on Heroku (or other platform)

With this, reserves can (in theory) completely ignore the `#help-desk` and listen only for the `#reserves` channel.

Version 0.0.0.0.0.0 alpha alpha 0 (early release) 🥳
