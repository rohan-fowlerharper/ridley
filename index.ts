import 'dotenv/config'
import { channelMention, ChannelType } from 'discord.js'
import type * as TDiscord from 'discord.js'

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
import {
  handleHelpDeskReactions,
  handleReserveAlertsReactions,
} from './handlers/reactionAdd'
import {
  handleHelpDeskReactionRemove,
  handleReserveAlertsReactionRemove,
} from './handlers/reactionRemove'

export type MessageStatus =
  | 'unresolved'
  | 'sentToLocalReserve'
  | 'sentToGlobalReserve'
  | 'resolved'

export type HelpMessage = Pick<
  TDiscord.Message,
  | 'createdTimestamp'
  | 'id'
  | 'channelId'
  | 'content'
  | 'author'
  | 'reactions'
  | 'mentions'
> & {
  status: MessageStatus
  dispatchedMessageId?: string
}

export type HelpMessageMap = Map<HelpMessage['id'], HelpMessage>
export type UnresolvedMessages = typeof unresolvedMessages

/**
 * stores unresolved messages in a map of categoryId -> messageId -> message
 * like an array of unresolved messages for each cohort (indexed by categoryId, and then messageId)
 */
const unresolvedMessages = new Map<
  TDiscord.CategoryChannel['id'],
  HelpMessageMap
>(CATEGORY_IDS.map((c) => [c, new Map()]))

client.once('ready', () => {
  console.log(`ready as ${client.user?.tag} at ${client.readyAt}`)

  // lol
  client.user?.setPresence({
    activities: [{ name: 'deploying reserves...' }],
    status: 'idle',
  })

  const manaiaCategoryChannel =
    getChannelById<TDiscord.CategoryChannel>(MANAIA_CATEGORY_ID)

  if (!manaiaCategoryChannel) return

  const reserveAlertsChannel = getReserveAlertsChannel(manaiaCategoryChannel)

  reserveAlertsChannel.send(`Ready to deploy the Reserves 🪖`)
})

client.on('messageReactionRemove', (reaction) => {
  if (reaction.partial) return
  const { isValid, channel, categoryChannel } = validateChildChannel(
    reaction.message.channel
  )
  if (!isValid) return
  if (!isActiveCohort(categoryChannel)) return
  const unresolvedMessagesForCategory = unresolvedMessages.get(
    categoryChannel.id
  )
  if (!unresolvedMessagesForCategory) return

  switch (channel.name) {
    case RESERVE_ALERTS_NAME:
      handleReserveAlertsReactionRemove({
        reaction,
        channel,
        unresolvedMessagesForCategory,
        categoryChannel,
        client,
      })
      break
    case HELP_DESK_NAME:
      handleHelpDeskReactionRemove({
        reaction,
        channel,
        unresolvedMessagesForCategory,
        categoryChannel,
        client,
      })
  }
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

  await checkForUnresolvedMessages(unresolvedMessages)
})

client.on('messageDelete', (message) => {
  // TODO: yep most of this block could be refactored
  // lines 172-184 and 142-154
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

  const didDelete = unresolvedMessagesForCategory.delete(message.id)
  console.log({ didDelete })
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

  const member = interaction.member as TDiscord.GuildMember

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
  setInterval(async () => {
    await checkForUnresolvedMessages(unresolvedMessages)
  }, ms)
}

checkEvery(POLLING_INTERVAL)

client.login(process.env.BOT_TOKEN)
