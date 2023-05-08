import * as dotenv from 'dotenv'
import type * as TDiscord from 'discord.js'
import { SlashCommandBuilder, Routes } from 'discord.js'
import { REST } from '@discordjs/rest'
import invariant from 'tiny-invariant'

dotenv.config()
const env = process.env.NODE_ENV || 'development'
const botToken =
  env === 'development' ? process.env.TEST_BOT_TOKEN : process.env.BOT_TOKEN
const appId =
  env === 'development' ? process.env.TEST_APP_ID : process.env.APP_ID

invariant(botToken, `bot token is required in .env for ${env}`)
invariant(appId, `app id is required in .env for ${env}`)

const cohortsOption = (option: TDiscord.SlashCommandStringOption) =>
  option
    .setName('cohort')
    .setDescription('control what cohort you are in the reserves for')
    .addChoices(
      { name: 'whai', value: 'whai' },
      { name: 'backup', value: 'backup' }
    )

// https://discordjs.guide/creating-your-bot/creating-commands.html#command-deployment-script
// TODO: automatically generate this from the commands folder
const commands = [
  new SlashCommandBuilder()
    .setName('reserves')
    .setDescription('Use the reserves commands')
    .addSubcommand((subcommand) =>
      subcommand.setName('list').setDescription('list all reserves')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('toggle')
        .setDescription('toggle the @reserves role for yourself')
        .addStringOption(cohortsOption)
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('join')
        .setDescription('add the @reserves role for yourself')
        .addStringOption(cohortsOption)
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('leave')
        .setDescription('remove the @reserves role for yourself')
        .addStringOption(cohortsOption)
    ),
].map((c) => c.toJSON())
const restClient = new REST({ version: '10' }).setToken(botToken)

restClient
  .put(Routes.applicationCommands(appId), {
    body: commands,
  })
  .then(() => {
    console.log('All is well with the world...')
  })
  .catch((err) => {
    console.log("All is not right in the world, here's what's wrong:", err)
  })
