import { channelMention, ChannelType, roleMention } from 'discord.js'

import {
  CATEGORY_IDS,
  FACILITATOR_ROLES,
  RESERVE_ROLE_ID,
  UNRESOLVED_MESSAGE_THRESHOLD,
  UNRESOLVED_TIME_THRESHOLD,
} from './constants'
import { getChannelById, getReserveAlertsChannel } from './get-channels'

import type { HelpMessage, HelpMessageMap, UnresolvedMessages } from './index'
import type {
  VoiceChannel,
  Message,
  GuildMember,
  PartialMessage,
  CategoryChannel,
  TextChannel,
} from 'discord.js'

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

export const isNewMessageWithoutReaction = (
  messagesWithoutReaction: HelpMessageMap
) => {
  return messagesWithoutReaction.size > UNRESOLVED_MESSAGE_THRESHOLD
}

export function checkForUnresolvedMessages(messages: UnresolvedMessages) {
  for (const [categoryId, unresolvedCategoryMessages] of messages) {
    for (const [id, message] of unresolvedCategoryMessages) {
      if (
        hasBeenWaitingWithoutReaction(message) ||
        isNewMessageWithoutReaction(unresolvedCategoryMessages)
      ) {
        const categoryChannel = getChannelById(categoryId) as CategoryChannel
        sendMessageToReserves(categoryChannel, message)
        unresolvedCategoryMessages.delete(id)
      }
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

  let response = `${roleMention(RESERVE_ROLE_ID)}\n${
    message.author.username
  } asked for help: ${(Date.now() - message.createdTimestamp) / 1000}s ago`

  if (voiceChannel) {
    response += `\nVoice channel: ${channelMention(voiceChannel.id)}`
  }

  reserveAlertsChannel.send(response)
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
export const validateMessage = (
  message: Message | PartialMessage
): ValidChannel | InvalidChannel => {
  const invalidChannel: InvalidChannel = {
    isValid: false,
    channel: null,
    categoryChannel: null,
  }
  if (message.channel.type !== ChannelType.GuildText) return invalidChannel

  const channel = message.channel
  const categoryChannel = channel.parent

  if (!categoryChannel) return invalidChannel

  return { isValid: true, channel, categoryChannel }
}
