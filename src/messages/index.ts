import type * as TDiscord from 'discord.js'
import { HELP_DESK_NAME } from '../utils/constants'
import { isActiveCohort, validateChildChannel } from '../utils/helpers'
import type { UnresolvedMessages } from '../types'

export async function setup(
  client: TDiscord.Client,
  unresolvedMessages: UnresolvedMessages
) {
  client.on('messageCreate', async (message) => {
    const { isValid, channel, categoryChannel } = validateChildChannel(
      message.channel
    )
    if (!isValid) return

    if (!isActiveCohort(categoryChannel)) return
    if (channel.name !== HELP_DESK_NAME) return

    const unresolvedMessagesForCategory = unresolvedMessages.get(
      categoryChannel.id
    )

    if (!unresolvedMessagesForCategory) return

    const mentionedChannel = message.mentions.channels.first()
    const mentionedRole = message.mentions.roles.first()

    if (mentionedChannel || mentionedRole) {
      unresolvedMessagesForCategory.set(message.id, {
        ...message,
        status: 'unresolved',
      })
    }
  })

  client.on('messageDelete', (message) => {
    const { isValid, channel, categoryChannel } = validateChildChannel(
      message.channel
    )
    if (!isValid) return

    if (!isActiveCohort(categoryChannel)) return
    if (channel.name !== HELP_DESK_NAME) return

    const unresolvedMessagesForCategory = unresolvedMessages.get(
      categoryChannel.id
    )

    if (!unresolvedMessagesForCategory) return

    unresolvedMessagesForCategory.delete(message.id)
  })
}
