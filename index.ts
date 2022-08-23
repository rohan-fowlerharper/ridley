import 'dotenv/config'
import { channelMention, ChannelType } from 'discord.js'

import { getChannelById, getReserveAlertsChannel } from './get-channels'
import {
  CATEGORY_IDS,
  HELP_DESK_NAME,
  MANAIA_CATEGORY_ID,
  POLLING_INTERVAL,
  RESERVE_ALERTS_NAME,
  RESERVE_ROLE_ID,
} from './constants'
import {
  checkForUnresolvedMessages,
  isActiveCohort,
  isFacilitator,
  validateChildChannel,
} from './helpers'
import { client } from './client'

import type { GuildMember, Message, CategoryChannel } from 'discord.js'
import {
  handleHelpDeskReactions,
  handleReserveAlertsReactions,
} from './handlers'

export type MessageStatus =
  | 'unresolved'
  | 'sentToLocalReserve'
  | 'sentToGlobalReserve'

export type HelpMessage = Pick<
  Message,
  | 'createdTimestamp'
  | 'id'
  | 'channelId'
  | 'content'
  | 'author'
  | 'reactions'
  | 'mentions'
> & {
  status: MessageStatus
}

export type HelpMessageMap = Map<HelpMessage['id'], HelpMessage>
export type UnresolvedMessages = typeof unresolvedMessages

/**
 * stores unresolved messages in a map of categoryId -> messageId -> message
 * like an array of unresolved messages for each cohort (indexed by categoryId, and then messageId)
 */
const unresolvedMessages = new Map<CategoryChannel['id'], HelpMessageMap>(
  CATEGORY_IDS.map((c) => [c, new Map()])
)

client.once('ready', () => {
  console.log(`ready as ${client.user?.tag} at ${client.readyAt}`)

  // lol
  client.user?.setPresence({
    activities: [{ name: 'deploying reserves...' }],
    status: 'idle',
  })

  const manaiaCategoryChannel =
    getChannelById<CategoryChannel>(MANAIA_CATEGORY_ID)

  if (!manaiaCategoryChannel) return

  const reserveAlertsChannel = getReserveAlertsChannel(manaiaCategoryChannel)

  reserveAlertsChannel.send(`Ready to deploy the Reserves 🪖`)
})

client.on('messageReactionAdd', (reaction) => {
  const { isValid, channel, categoryChannel } = validateChildChannel(
    reaction.message.channel
  )
  if (!isValid) return
  if (!isActiveCohort(categoryChannel)) return

  switch (channel.name) {
    case HELP_DESK_NAME:
      handleHelpDeskReactions({
        reaction,
        channel,
        categoryChannel,
        messages: unresolvedMessages,
      })
      break
    case RESERVE_ALERTS_NAME:
      handleReserveAlertsReactions({
        reaction,
        channel,
        categoryChannel,
        messages: unresolvedMessages,
      })
  }
})

// TODO: refactor to handlers/message-create.ts or handlers.ts
client.on('messageCreate', async (message) => {
  const { isValid, channel, categoryChannel } = validateChildChannel(
    message.channel
  )
  if (!isValid) return

  if (!isActiveCohort(categoryChannel)) return
  if (channel.name !== HELP_DESK_NAME) return

  const unresolvedMessagesForCategory = unresolvedMessages.get(
    categoryChannel.id
  )

  if (!unresolvedMessagesForCategory) return

  const mentionedChannel = message.mentions.channels.first()
  const mentionedRole = message.mentions.roles.first()

  if (mentionedChannel || mentionedRole) {
    unresolvedMessagesForCategory.set(message.id, {
      ...message,
      status: 'unresolved',
    })
  }

  checkForUnresolvedMessages(unresolvedMessages)
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return
  if (interaction.channel?.type !== ChannelType.GuildText) return

  const channel = interaction.channel
  const categoryChannel = channel.parent

  if (!categoryChannel) {
    await interaction.reply("Wait... This channel isn't in a cohort 🤔")
    return
  }

  const reserveAlertsChannel = getReserveAlertsChannel(categoryChannel)

  if (channel.name !== RESERVE_ALERTS_NAME) {
    await interaction.reply(
      `These are not the channels you're looking for 🤖. Try ${channelMention(
        reserveAlertsChannel.id
      )}`
    )
    return
  }

  const member = interaction.member as GuildMember

  if (!isFacilitator(member)) {
    await interaction.reply('Wait... you need to be a facilitator to do that')
    return
  }

  if (interaction.commandName === 'reserves') {
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
    checkForUnresolvedMessages(unresolvedMessages)
  }, ms)
}

checkEvery(POLLING_INTERVAL)

client.login(process.env.BOT_TOKEN)
