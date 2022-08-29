import type * as TDiscord from 'discord.js'
import { HELP_DESK_NAME, RESERVE_ALERTS_NAME } from '../utils/constants'
import { isActiveCohort, validateChildChannel } from '../utils/helpers'
import type { UnresolvedMessages } from '../types'
import * as handlers from './handlers'

export async function setup(
  client: TDiscord.Client,
  unresolvedMessages: UnresolvedMessages
) {
  client.on('messageReactionRemove', (reaction) => {
    if (reaction.partial) return
    const { isValid, channel, categoryChannel } = validateChildChannel(
      reaction.message.channel
    )
    if (!isValid) return
    if (!isActiveCohort(categoryChannel)) return
    const unresolvedMessagesForCategory = unresolvedMessages.get(
      categoryChannel.id
    )
    if (!unresolvedMessagesForCategory) return

    const handlerProps = {
      client,
      reaction,
      channel,
      categoryChannel,
      messages: unresolvedMessagesForCategory,
    }

    switch (channel.name) {
      case RESERVE_ALERTS_NAME:
        handlers.handleReserveAlertsReactionRemove(handlerProps)
        break
      case HELP_DESK_NAME:
        handlers.handleHelpDeskReactionRemove(handlerProps)
    }
  })

  client.on('messageReactionAdd', (reaction) => {
    const { isValid, channel, categoryChannel } = validateChildChannel(
      reaction.message.channel
    )
    if (!isValid) return
    if (!isActiveCohort(categoryChannel)) return
    const unresolvedMessagesForCategory = unresolvedMessages.get(
      categoryChannel.id
    )
    if (!unresolvedMessagesForCategory) return

    switch (channel.name) {
      case HELP_DESK_NAME:
        handlers.handleHelpDeskReactionsAdd({
          reaction,
          channel,
          categoryChannel,
          messages: unresolvedMessagesForCategory,
          client,
        })
        break
      case RESERVE_ALERTS_NAME:
        handlers.handleReserveAlertsReactionsAdd({
          reaction,
          channel,
          categoryChannel,
          messages: unresolvedMessagesForCategory,
          client,
        })
    }
  })
}
