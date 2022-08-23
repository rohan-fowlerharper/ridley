import { checkForUnresolvedMessages } from './helpers'
import { getHelpDeskChannel } from './get-channels'

import type {
  TextChannel,
  CategoryChannel,
  MessageReaction,
  PartialMessageReaction,
} from 'discord.js'
import type { UnresolvedMessages } from './index'

type ReactionHandlerProps = {
  channel: TextChannel
  categoryChannel: CategoryChannel
  messages: UnresolvedMessages
  reaction: MessageReaction | PartialMessageReaction
}

export async function handleHelpDeskReactions({
  categoryChannel,
  messages,
  reaction,
}: ReactionHandlerProps) {
  const unresolvedMessagesForCategory = messages.get(categoryChannel.id)
  if (!unresolvedMessagesForCategory) return

  unresolvedMessagesForCategory.delete(reaction.message.id)

  checkForUnresolvedMessages(messages)
}

export async function handleReserveAlertsReactions({
  categoryChannel,
  reaction,
  messages,
}: ReactionHandlerProps) {
  const unresolvedMessagesForCategory = messages.get(categoryChannel.id)
  if (!unresolvedMessagesForCategory) return

  if (!reaction.message.embeds[0]) return

  const messageId = reaction.message.embeds[0]?.fields[0]?.value
  if (!messageId) return

  const helpDeskChannel = getHelpDeskChannel(categoryChannel)
  const helpDeskMessage = helpDeskChannel?.messages.cache.get(messageId)

  if (!helpDeskMessage) return
  await helpDeskMessage.react(reaction.emoji)

  unresolvedMessagesForCategory.delete(reaction.message.id)
}
