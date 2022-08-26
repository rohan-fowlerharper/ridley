import 'dotenv/config'
import {
  channelMention,
  ChannelType,
  EmbedBuilder,
  userMention,
} from 'discord.js'
import type * as TDiscord from 'discord.js'

import { getChannelById, getReserveAlertsChannel } from './get-channels'
import {
  CATEGORY_IDS,
  DAA_SERVER_ID,
  HELP_DESK_NAME,
  MANAIA_CATEGORY_ID,
  POLLING_INTERVAL,
  RESERVE_ALERTS_NAME,
} from './constants'
import {
  checkForUnresolvedMessages,
  getActiveReserves,
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
import {
  addReservesRole,
  listReserves,
  removeReservesRole,
  toggleReserveRole,
} from './commands/reserves'

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

client.once('ready', async (client) => {
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

  const reserves = await getActiveReserves(
    client.guilds.cache.get(DAA_SERVER_ID)!
  )

  const embed = new EmbedBuilder()
    .setTitle('Ready to deploy the Reserves 🪖')
    .addFields(
      {
        name: 'Active Reserves:',
        value: reserves.size
          ? reserves.map((r) => userMention(r.user.id)).join(', ')
          : 'None',
      },
      {
        name: 'Total:',
        value: reserves.size.toString(),
      }
    )
    .setColor('#e91e63')

  reserveAlertsChannel.send({
    content: `Reserver Alerter started`,
    embeds: [embed],
  })
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
      switch (interaction.options.getSubcommand()) {
        case 'list':
          await listReserves(interaction)
          break
        case 'toggle':
          await toggleReserveRole(interaction)
          break
        case 'join':
          await addReservesRole(interaction)
          break
        case 'leave':
          await removeReservesRole(interaction)
      }
    } catch (err) {
      console.error(err)
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
