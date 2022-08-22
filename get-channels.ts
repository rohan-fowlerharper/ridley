import { HELP_DESK_NAME, RESERVE_ALERTS_NAME } from './constants'
import { client } from './client'

import type { TextChannel, CategoryChannel } from 'discord.js'

export function getChannelById(id: string) {
  return client.channels.cache.get(id)
}

export function getReserveAlertsChannel(categoryChannel: CategoryChannel) {
  return getChannelByName(categoryChannel, RESERVE_ALERTS_NAME) as TextChannel
}

export function getHelpDeskChannel(categoryChannel: CategoryChannel) {
  return getChannelByName(categoryChannel, HELP_DESK_NAME) as TextChannel
}

function getChannelByName(
  categoryChannel: CategoryChannel,
  channelName: string
) {
  return categoryChannel.children.cache.find((c) => c.name === channelName)
}
