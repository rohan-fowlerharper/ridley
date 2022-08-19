import 'dotenv/config'
import { channelMention } from 'discord.js'

import { getReserveAlertsChannel } from './get-channels'
import {
  HELP_DESK_CHANNEL_ID,
  POLLLING_INTERVAL,
  RESERVE_ALERTS_CHANNEL_ID,
  RESERVE_ROLE_ID,
} from './constants'
import { checkForUnresolvedMessages } from './helpers'
import { client } from './client'

import type { GuildMember, Message } from 'discord.js'

export type HelpMessage = Pick<
  Message,
  | 'createdTimestamp'
  | 'id'
  | 'channelId'
  | 'content'
  | 'author'
  | 'reactions'
  | 'mentions'
>
export type HelpMessageMap = typeof unresolvedMessages

// stored as a global for now
// it is either mutated in this file or via explicit params
const unresolvedMessages = new Map<HelpMessage['id'], HelpMessage>()

client.once('ready', () => {
  console.log(`ready as ${client.user?.tag} at ${client.readyAt}`)

  // lol
  client.user?.setPresence({
    activities: [{ name: 'trying to make this thing work argh' }],
    status: 'idle',
  })

  const reserveAlertsChannel = getReserveAlertsChannel(client)

  reserveAlertsChannel.send(`ready as ${client.user?.tag} at ${client.readyAt}`)
})

client.on('messageReactionAdd', (reaction) => {
  if (reaction.message.channel.id !== HELP_DESK_CHANNEL_ID) return

  unresolvedMessages.delete(reaction.message.id)

  checkForUnresolvedMessages(unresolvedMessages)
})

client.on('messageCreate', async (message) => {
  if (message.channelId !== HELP_DESK_CHANNEL_ID || message.author.bot) return

  const mentionedChannel = message.mentions.channels.first()
  const mentionedRole = message.mentions.roles.first()

  if (
    (mentionedChannel || mentionedRole) &&
    message.reactions.cache.size === 0
  ) {
    unresolvedMessages.set(message.id, message)
  }

  checkForUnresolvedMessages(unresolvedMessages)
})

const facilitatorRoles = [
  'dev academy staff',
  'facilitators-all-campuses',
  'online-facilitators',
  'wellington-facilitators',
  'auckland-facilitators',
]

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return
  if (interaction.channelId !== RESERVE_ALERTS_CHANNEL_ID) {
    await interaction.reply(
      `These are not the channels you're looking for 🤖. Try ${channelMention(
        RESERVE_ALERTS_CHANNEL_ID
      )}`
    )
    return
  }

  const member = interaction.member as GuildMember

  if (
    !member?.roles.cache.some((role) => facilitatorRoles.includes(role.name))
  ) {
    await interaction.reply('Wait... you need to be a facilitator to do that')
    return
  }

  const { commandName } = interaction

  if (commandName === 'reserves') {
    try {
      if (member?.roles.cache.some((role) => role.id === RESERVE_ROLE_ID)) {
        await member.roles.remove(RESERVE_ROLE_ID)
        await interaction.reply('You have been dismissed from the reserve. 💌')
        return
      } else {
        await member.roles.add(RESERVE_ROLE_ID)
        await interaction.reply('Welcome to the reserve! 🥳')
        return
      }
    } catch (err) {
      console.log(err)
      await interaction.reply('Argh, Bananas and Ferarris! Something happened.')
    }
  }
})

// basic polling
const checkEvery = (ms: number) => {
  setInterval(() => {
    console.log('num unresolved messages:', unresolvedMessages.size)
    checkForUnresolvedMessages(unresolvedMessages)
  }, ms)
}

checkEvery(POLLLING_INTERVAL)

client.login(process.env.BOT_TOKEN)
