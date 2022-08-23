import { HELP_DESK_NAME, RESERVE_ALERTS_NAME } from './constants'
import { client } from './client'

import { TextChannel, CategoryChannel, Channel } from 'discord.js'

export function getChannelById<TChannel extends Channel>(id: Channel['id']) {
  return client.channels.cache.get(id) as TChannel
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
