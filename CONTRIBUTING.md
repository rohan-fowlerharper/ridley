## Contributing Guide

Hey, thanks for reading! If you'd like to contribute to the discord bot, I hope you find this brief guide useful. If you have any gotchas or notes you'd like to add, please feel free to make commits/PRs to this file!

## Getting Started:

There are two instances of the Reserves bot, one which runs on the real Dev Academy Aotearoa Discord server and one which runs on a simplified test server. To get the credentials to run the bot on the test server, contact Rohan Fowler-Harper or anyone you may know who has contributed before!

The credentials for the test server will look something like:

```sh
TEST_BOT_TOKEN="TEST_BOT_TOKEN"
TEST_APP_ID="TEST_APP_ID"
TEST_GUILD_ID="<TEST_GUILD_ID>"
```

Once added to the server, get somebody to add admin priveleges to your profile so that you have full-control over your roles and channels.

This repository uses [pnpm](https://pnpm.io) as a package manager (in place of npm). So, if you don't have it installed already, run:

```sh
npm install -g pnpm
```

Clone, `cd` into the project, and install the packages:

```sh
git clone https://github.com/enspiral-dev-academy/reserves-script.git # or git@github.com:enspiral-dev-academy/reserves-script.git for SSH
cd reserves-script
pnpm install
```

Create and populate a `.env` file with the test credentials.

To start the bot for development, run:

```sh
pnpm start
```

If you have access to the real bot credentials _and_ access to the Heroku deployment you must:

- stop the Heroku dyno from with:
  ```sh
  heroku ps:scale worker=0
  ```
  or by stopping the dyno from the Heroku dashboard
- start the bot with:
  ```sh
  pnpm run preview # to use mock-help-desk and staging intervals/thresholds
  NODE_ENV=production pnpm start # to use help-desk and production intervals/thresholds
  ```

