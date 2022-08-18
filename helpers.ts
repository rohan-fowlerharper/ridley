import { channelMention, roleMention, VoiceChannel } from 'discord.js'
import { RESERVE_ROLE_ID } from './constants'
import { getReserveAlertsChannel } from './get-channels'
import { TIMEOUT } from './constants'
import { client } from './client'
import { HelpMessage, HelpMessageMap } from './index'

export const hasBeenWaitingWithoutReaction = (message: HelpMessage) => {
  return (
    Date.now() - message.createdTimestamp > TIMEOUT &&
    message.reactions.cache.size === 0
  )
}

export const removeMessage = (
  messages: HelpMessageMap,
  id: HelpMessage['id']
): void => {
  const message = messages.get(id)

  if (message) {
    messages.delete(id)
  }
}

export const isNewMessageWithoutReaction = (
  messagesWithoutReaction: HelpMessageMap
) => {
  return messagesWithoutReaction.size > 3
}

export function checkForUnresolvedMessages(messages: HelpMessageMap) {
  for (const [id, message] of messages) {
    if (
      hasBeenWaitingWithoutReaction(message) ||
      isNewMessageWithoutReaction(messages)
    ) {
      // resolve message
      sendMessageToReserves(message)

      // remove message
      removeMessage(messages, message.id)
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
