import {
  Channel,
  channelMention,
  ChannelType,
  EmbedBuilder,
  roleMention,
  VoiceChannel,
} from 'discord.js'

import {
  CATEGORY_IDS,
  FACILITATOR_ROLES,
  RESERVE_ROLE_ID,
  UNRESOLVED_MESSAGE_THRESHOLD,
  UNRESOLVED_TIME_THRESHOLD,
} from './constants'
import { getChannelById, getReserveAlertsChannel } from './get-channels'

import type {
  HelpMessage,
  HelpMessageMap,
  MessageStatus,
  UnresolvedMessages,
} from './index'
import type { GuildMember, CategoryChannel, TextChannel } from 'discord.js'

export const isActiveCohort = (categoryChannel: CategoryChannel) =>
  CATEGORY_IDS.includes(categoryChannel.id)

export const isFacilitator = (member: GuildMember) => {
  return member?.roles.cache.some((role) =>
    FACILITATOR_ROLES.includes(role.name)
  )
}

export const hasBeenWaitingWithoutReaction = (message: HelpMessage) => {
  return (
    Date.now() - message.createdTimestamp > UNRESOLVED_TIME_THRESHOLD &&
    message.reactions.cache.size === 0
  )
}

export const isNewMessageWithoutReaction = (messages: HelpMessageMap) => {
  return getNumberOfUnresolvedMessages(messages) > UNRESOLVED_MESSAGE_THRESHOLD
}

export const getNumberOfUnresolvedMessages = (messages: HelpMessageMap) => {
  return filterMessagesByStatus(messages, 'unresolved').size
}

export const filterMessagesByStatus = (
  messages: HelpMessageMap,
  status: MessageStatus
): HelpMessageMap => {
  return new Map([...messages].filter(([, m]) => m.status === status))
}

export function checkForUnresolvedMessages(messages: UnresolvedMessages) {
  for (const [categoryId, unresolvedCategoryMessages] of messages) {
    const categoryChannel = getChannelById<CategoryChannel>(categoryId)
    for (const [, message] of unresolvedCategoryMessages) {
      if (
        (hasBeenWaitingWithoutReaction(message) ||
          isNewMessageWithoutReaction(unresolvedCategoryMessages)) &&
        message.status === 'unresolved'
      ) {
        sendMessageToReserves(categoryChannel, message)
        message.status = 'sentToLocalReserve'
      }
    }
    if (categoryChannel.name === 'Manaia 2022') {
      console.log({
        unresolved: getNumberOfUnresolvedMessages(unresolvedCategoryMessages),
        sentLocal: filterMessagesByStatus(
          unresolvedCategoryMessages,
          'sentToLocalReserve'
        ).size,
      })
    }
  }
}

export function sendMessageToReserves(
  categoryChannel: CategoryChannel,
  message: HelpMessage
) {
  const reserveAlertsChannel = getReserveAlertsChannel(categoryChannel)
  let voiceChannel: VoiceChannel | undefined

  if (message.mentions.channels.size > 0) {
    voiceChannel = message.mentions.channels.find(
      (c) => c.type === ChannelType.GuildVoice
    ) as VoiceChannel | undefined
  }

  let response = `${roleMention(RESERVE_ROLE_ID)}`

  if (voiceChannel) {
    response += ` ${channelMention(voiceChannel.id)}`
  }

  response += '\n'

  const embed = new EmbedBuilder()
    .setDescription(`>>> ${message.content}`)
    .setAuthor({
      name: message.author.username,
      iconURL: message.author.displayAvatarURL(),
    })
    .addFields(
      { name: 'Message ID', value: message.id, inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      {
        name: 'Time',
        value: `${Math.ceil(
          (Date.now() - message.createdTimestamp) / 1000
        )}s ago`,
        inline: true,
      }
    )
    .setTimestamp(message.createdTimestamp)
    .setColor('#e91e63')

  reserveAlertsChannel.send({ embeds: [embed], content: response })
}

type ValidChannel = {
  isValid: true
  channel: TextChannel
  categoryChannel: CategoryChannel
}
type InvalidChannel = {
  isValid: false
  channel: null
  categoryChannel: null
}
export const validateChildChannel = (
  channel: Channel | undefined
): ValidChannel | InvalidChannel => {
  const invalidChannel: InvalidChannel = {
    isValid: false,
    channel: null,
    categoryChannel: null,
  }
  if (!channel) return invalidChannel

  if (channel.type !== ChannelType.GuildText) return invalidChannel

  const categoryChannel = channel.parent

  if (!categoryChannel) return invalidChannel

  return { isValid: true, channel, categoryChannel }
}
