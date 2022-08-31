import * as dotenv from 'dotenv'
import type * as TDiscord from 'discord.js'
import { SlashCommandBuilder, Routes } from 'discord.js'
import { REST } from '@discordjs/rest'
import invariant from 'tiny-invariant'

dotenv.config()
const { BOT_TOKEN, APP_ID } = process.env

invariant(BOT_TOKEN, 'BOT_TOKEN is required')
invariant(APP_ID, 'APP_ID is required')

const cohortsOption = (option: TDiscord.SlashCommandStringOption) =>
  option
    .setName('cohort')
    .setDescription('control what cohort you are in the reserves for')
    .addChoices(
      { name: 'manaia', value: 'manaia' },
      { name: 'pikopiko', value: 'pikopiko' },
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
const restClient = new REST({ version: '10' }).setToken(BOT_TOKEN)

restClient
  .put(Routes.applicationCommands(APP_ID), {
    body: commands,
  })
  .then(() => {
    console.log('All is well with the world...')
  })
  .catch((err) => {
    console.log("All is not right in the world, here's what's wrong:", err)
  })
