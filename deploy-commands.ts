import 'dotenv/config'
import { SlashCommandBuilder, Routes } from 'discord.js'
import { REST } from '@discordjs/rest'

const { BOT_TOKEN, APP_ID } = process.env

if (!BOT_TOKEN || !APP_ID) {
  throw new Error('BOT_TOKEN and APP_ID must be set')
}

// https://discordjs.guide/creating-your-bot/creating-commands.html#command-deployment-script
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
