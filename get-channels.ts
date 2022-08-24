import { HELP_DESK_NAME, RESERVE_ALERTS_NAME } from './constants'
import { client } from './client'

import type * as TDiscord from 'discord.js'

export function getChannelById<TChannel extends TDiscord.Channel>(
  id: TDiscord.Channel['id']
) {
  return client.channels.cache.get(id) as TChannel
}

export function getReserveAlertsChannel(
  categoryChannel: TDiscord.CategoryChannel
) {
  return getChannelByName(
    categoryChannel,
    RESERVE_ALERTS_NAME
  ) as TDiscord.TextChannel
}

export function getHelpDeskChannel(categoryChannel: TDiscord.CategoryChannel) {
  return getChannelByName(
    categoryChannel,
    HELP_DESK_NAME
  ) as TDiscord.TextChannel
}

function getChannelByName(
  categoryChannel: TDiscord.CategoryChannel,
  channelName: string
) {
  return categoryChannel.children.cache.find((c) => c.name === channelName)
}
