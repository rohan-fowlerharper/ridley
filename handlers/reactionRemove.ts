import type * as TDiscord from 'discord.js'
import { getHelpDeskChannel, getReserveAlertsChannel } from '../get-channels'
import { HelpMessageMap } from '../index'

type HandlerProps = {
  channel: TDiscord.TextChannel
  categoryChannel: TDiscord.CategoryChannel
  unresolvedMessagesForCategory: HelpMessageMap
  reaction: TDiscord.MessageReaction
  client: TDiscord.Client
}

export async function handleReserveAlertsReactionRemove({
  categoryChannel,
  reaction,
  client,
}: HandlerProps) {
  // TODO: try and get message via message.dispatchedMessageId
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
  unresolvedMessagesForCategory,
  client,
}: HandlerProps) {
  console.log(reaction.message.id)
  console.log(unresolvedMessagesForCategory)
  const message = unresolvedMessagesForCategory.get(reaction.message.id)
  // const message = unresolvedMessagesForCategory.get(reaction.message.id)
  console.log(message)
  if (message?.dispatchedMessageId) {
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
