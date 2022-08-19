import { channelMention, roleMention } from 'discord.js'

import {
  RESERVE_ROLE_ID,
  UNRESOLVED_MESSAGE_THRESHOLD,
  UNRESOLVED_TIME_THRESHOLD,
} from './constants'
import { getReserveAlertsChannel } from './get-channels'
import { client } from './client'

import type { HelpMessage, HelpMessageMap } from './index'
import type { VoiceChannel } from 'discord.js'

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

export function checkForUnresolvedMessages(messages: HelpMessageMap) {
  for (const [id, message] of messages) {
    if (
      hasBeenWaitingWithoutReaction(message) ||
      isNewMessageWithoutReaction(messages)
    ) {
      sendMessageToReserves(message)
      messages.delete(id)
    }
  }
}

export function sendMessageToReserves(message: HelpMessage) {
  const reserveAlertsChannel = getReserveAlertsChannel(client)
  let voiceChannel: VoiceChannel | undefined

  if (
    message.mentions.channels.size > 0 &&
    message.mentions.channels.first()?.type === 2
  ) {
    voiceChannel = message.mentions.channels.first() as VoiceChannel
  }

  let response = `${roleMention(RESERVE_ROLE_ID)}\n${
    message.author.username
  } asked for help: ${(Date.now() - message.createdTimestamp) / 1000}s ago`

  if (voiceChannel) {
    response += `\nVoice channel: ${channelMention(voiceChannel.id)}`
  }

  reserveAlertsChannel.send(response)
}
