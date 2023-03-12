import type * as TDiscord from 'discord.js'
import { HELP_DESK_NAME } from '../utils/constants'
import {
  isActiveCohort,
  isStudentMessage,
  validateChildChannel,
} from '../utils/helpers'
import type { UnresolvedMessages } from '../types'

export async function setup(
  client: TDiscord.Client,
  unresolvedMessages: UnresolvedMessages
) {
  client.on('messageCreate', async (message) => {
    const { isValid, channel, categoryChannel } = validateChildChannel(
      message.channel
    )
    console.log(isValid)
    if (!isValid) return
    console.log('is valid')
    if (!isActiveCohort(categoryChannel)) return
    console.log('is active cohort')
    if (channel.name !== HELP_DESK_NAME) return
    console.log('is help desk')
    if (!isStudentMessage(message)) return

    console.log('is help message')

    const unresolvedMessagesForCategory = unresolvedMessages.get(
      categoryChannel.id
    )

    console.log(unresolvedMessages)

    if (!unresolvedMessagesForCategory) return
    console.log('has category')

    const mentionedChannel = message.mentions.channels.first()
    const mentionedRole = message.mentions.roles.first()

    const isHelpMessage = () => {
      console.log('checking mentionedChannel')
      if (mentionedChannel) return true
      console.log('checking mentionedRole')
      if (mentionedRole) return true

      console.log('checking for "help in"')
      if (message.content.toLowerCase().includes('help in')) return true

      console.log('unchecked')
      return false
    }

    if (isHelpMessage()) {
      console.log('is help message, adding to list...')
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
