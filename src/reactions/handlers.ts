import {
  getHelpDeskChannel,
  getReserveAlertsChannel,
} from '../utils/get-channels'

import type * as TDiscord from 'discord.js'
import type { UnresolvedMessagesForCategory } from '../types'
import { resolveMessage } from '../utils/helpers'

type HandlerProps = {
  client: TDiscord.Client
  channel: TDiscord.TextChannel
  categoryChannel: TDiscord.CategoryChannel
  messages: UnresolvedMessagesForCategory
  reaction: TDiscord.MessageReaction | TDiscord.PartialMessageReaction
}

export async function handleHelpDeskReactionsAdd({
  categoryChannel,
  messages,
  reaction,
}: HandlerProps) {
  if (reaction.me) return

  const message = messages.get(reaction.message.id)

  if (message?.dispatchedMessageId) {
    const reserveAlertsChannel = getReserveAlertsChannel(categoryChannel)

    const reserveAlertsMessage = reserveAlertsChannel?.messages.cache.get(
      message.dispatchedMessageId
    )
    await reserveAlertsMessage?.react(reaction.emoji)
  }

  resolveMessage(messages, reaction.message.id)
}

export async function handleReserveAlertsReactionsAdd({
  categoryChannel,
  reaction,
  messages,
}: HandlerProps) {
  if (reaction.me) return

  if (!reaction.message.embeds[0]) return

  // dependent on first field being messageId
  const messageId = reaction.message.embeds[0].fields[0]?.value
  if (!messageId) return

  const helpDeskChannel = getHelpDeskChannel(categoryChannel)
  const helpDeskMessage = helpDeskChannel.messages.cache.get(messageId)

  if (!helpDeskMessage) return
  await helpDeskMessage.react(reaction.emoji)

  resolveMessage(messages, reaction.message.id)
}

export async function handleReserveAlertsReactionRemove({
  categoryChannel,
  reaction,
  client,
}: HandlerProps) {
  if (!reaction.message.embeds[0]) return
  const messageId = reaction.message.embeds[0].fields[0]?.value
  if (!messageId) return

  const helpDeskChannel = getHelpDeskChannel(categoryChannel)
  const helpDeskMessage = helpDeskChannel.messages.cache.get(messageId)
  if (!helpDeskMessage) return

  await removeBotReaction(helpDeskMessage, client.user?.id!, reaction.emoji)
}

export async function handleHelpDeskReactionRemove({
  categoryChannel,
  reaction,
  messages,
  client,
}: HandlerProps) {
  const message = messages.get(reaction.message.id)
  if (!message?.dispatchedMessageId) return

  const reserveAlertsChannel = getReserveAlertsChannel(categoryChannel)

  const reserveAlertsMessage = reserveAlertsChannel?.messages.cache.get(
    message.dispatchedMessageId
  )

  if (!reserveAlertsMessage) return

  await removeBotReaction(
    reserveAlertsMessage,
    client.user?.id!,
    reaction.emoji
  )
  // TODO: decide if we want to change message status back to something
}

async function removeBotReaction(
  message: TDiscord.Message,
  botId: string,
  emoji: TDiscord.GuildEmoji | TDiscord.ReactionEmoji
) {
  const botReaction = message.reactions.cache.find(
    (r) => r.users.cache.has(botId) && r.emoji.name === emoji.name
  )

  await botReaction?.users.remove(botId)
}
