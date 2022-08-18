import 'dotenv/config'
import type { Message } from 'discord.js'
import { getReserveAlertsChannel } from './get-channels'
import { HELP_DESK_CHANNEL_ID } from './constants'
import { checkForUnresolvedMessages, removeMessage } from './helpers'

import { client } from './client'

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
export type HelpMessageMap = typeof helpMessagesWithoutReaction

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

// stored as a global for now
// it is either mutated in this file or via explicit params
// const helpMessagesWithoutReaction: HelpMessage[] = [] // old
const helpMessagesWithoutReaction = new Map<HelpMessage['id'], HelpMessage>()

client.on('messageReactionAdd', (reaction) => {
  if (reaction.message.channel.id !== HELP_DESK_CHANNEL_ID) return

  removeMessage(helpMessagesWithoutReaction, reaction.message.id)

  checkForUnresolvedMessages(helpMessagesWithoutReaction)
})

client.on('messageCreate', async (message) => {
  if (message.channelId !== HELP_DESK_CHANNEL_ID || message.author.bot) return

  const mentionedChannel = message.mentions.channels.first()
  const mentionedRole = message.mentions.roles.first()

  if (
    (mentionedChannel || mentionedRole) &&
    message.reactions.cache.size === 0
  ) {
    helpMessagesWithoutReaction.set(message.id, message)
  }

  checkForUnresolvedMessages(helpMessagesWithoutReaction)
})

// basic polling
const checkEvery = (ms: number) => {
  setInterval(() => {
    console.log('num unresolved messages: ', helpMessagesWithoutReaction.size)
    checkForUnresolvedMessages(helpMessagesWithoutReaction)
  }, ms)
}

checkEvery(5000)

client.login(process.env.BOT_TOKEN)
