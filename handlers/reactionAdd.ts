import { getHelpDeskChannel, getReserveAlertsChannel } from '../get-channels'

import type * as TDiscord from 'discord.js'
import type { UnresolvedMessages } from '../index'
import { resolveMessage } from '../helpers'

type ReactionHandlerProps = {
  channel: TDiscord.TextChannel
  categoryChannel: TDiscord.CategoryChannel
  messages: UnresolvedMessages
  reaction: TDiscord.MessageReaction | TDiscord.PartialMessageReaction
}

export async function handleHelpDeskReactions({
  categoryChannel,
  messages,
  reaction,
}: ReactionHandlerProps) {
  if (reaction.me) return

  const unresolvedMessagesForCategory = messages.get(categoryChannel.id)
  if (!unresolvedMessagesForCategory) return

  const message = unresolvedMessagesForCategory.get(reaction.message.id)
  console.log(message)
  if (message?.dispatchedMessageId) {
    const reserveAlertsChannel = getReserveAlertsChannel(categoryChannel)

    const reserveAlertsMessage = reserveAlertsChannel?.messages.cache.get(
      message.dispatchedMessageId
    )
    await reserveAlertsMessage?.react(reaction.emoji)
  }

  resolveMessage(unresolvedMessagesForCategory, reaction.message.id)
}

export async function handleReserveAlertsReactions({
  categoryChannel,
  reaction,
  messages,
}: ReactionHandlerProps) {
  if (reaction.me) return
  const unresolvedMessagesForCategory = messages.get(categoryChannel.id)
  if (!unresolvedMessagesForCategory) return

  if (!reaction.message.embeds[0]) return

  // dependent on first field being messageId
  const messageId = reaction.message.embeds[0].fields[0]?.value
  if (!messageId) return

  const helpDeskChannel = getHelpDeskChannel(categoryChannel)
  const helpDeskMessage = helpDeskChannel.messages.cache.get(messageId)

  if (!helpDeskMessage) return
  await helpDeskMessage.react(reaction.emoji)

  resolveMessage(unresolvedMessagesForCategory, reaction.message.id)
}
