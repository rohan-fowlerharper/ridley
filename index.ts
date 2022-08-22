import 'dotenv/config'
import {
  channelMention,
  TextChannel,
  GuildMember,
  Message,
  CategoryChannel,
} from 'discord.js'

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
  validateMessage,
} from './helpers'
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
export type HelpMessageMap = Map<HelpMessage['id'], HelpMessage>
export type UnresolvedMessages = typeof unresolvedMessages

// stored as a global for now
// it is either mutated in this file or via explicit params
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
  const manaiaCategoryChannel = getChannelById(
    MANAIA_CATEGORY_ID
  ) as CategoryChannel
  const reserveAlertsChannel = getReserveAlertsChannel(manaiaCategoryChannel)

  reserveAlertsChannel.send(`Ready to deploy the Reserves 🪖`)
})

client.on('messageReactionAdd', (reaction) => {
  const { isValid, channel, categoryChannel } = validateMessage(
    reaction.message
  )
  if (!isValid) return
  if (!isActiveCohort(categoryChannel)) return
  if (channel.name !== HELP_DESK_NAME) return

  const unresolvedMessagesForCategory = unresolvedMessages.get(
    categoryChannel.id
  )
  if (!unresolvedMessagesForCategory) return

  unresolvedMessagesForCategory.delete(reaction.message.id)

  checkForUnresolvedMessages(unresolvedMessages)
})

client.on('messageCreate', async (message) => {
  const { isValid, channel, categoryChannel } = validateMessage(message)
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
    unresolvedMessagesForCategory.set(message.id, message)
  }

  checkForUnresolvedMessages(unresolvedMessages)
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return
  if (!(interaction.channel instanceof TextChannel)) return

  const channel = interaction.channel
  const categoryChannel = channel?.parent

  if (!categoryChannel) return

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
