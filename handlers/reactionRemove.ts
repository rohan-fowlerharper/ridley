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

  await removeBotReactions(helpDeskMessage, client, reaction.emoji)
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
    console.log(reserveAlertsMessage)
    if (!reserveAlertsMessage) return

    await removeBotReactions(reserveAlertsMessage, client, reaction.emoji)
  }
}

async function removeBotReactions(
  message: TDiscord.Message,
  client: TDiscord.Client,
  emoji: TDiscord.GuildEmoji | TDiscord.ReactionEmoji
) {
  const botId = client.user?.id!
  const botReactions = message.reactions.cache.filter((r) =>
    r.users.cache.has(botId)
  )

  try {
    for (const botReaction of botReactions.values()) {
      if (botReaction.emoji.name === emoji.name) {
        await botReaction.users.remove(botId)
        break
      }
    }
  } catch (err) {
    return
  }
}
