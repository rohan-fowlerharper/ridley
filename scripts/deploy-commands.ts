import * as dotenv from 'dotenv'
import { SlashCommandBuilder, Routes } from 'discord.js'
import { REST } from '@discordjs/rest'
import invariant from 'tiny-invariant'

dotenv.config({
  path:
    process.env.NODE_ENV === 'production'
      ? '.env.production'
      : '.env.development',
})
const { BOT_TOKEN, APP_ID } = process.env

invariant(BOT_TOKEN, 'BOT_TOKEN is required')
invariant(APP_ID, 'APP_ID is required')

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
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('join')
        .setDescription('add the @reserves role for yourself')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('leave')
        .setDescription('remove the @reserves role for yourself')
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
