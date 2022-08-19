import { RESERVE_ALERTS_CHANNEL_ID, HELP_DESK_CHANNEL_ID } from './constants'

import type { TextChannel, Client } from 'discord.js'

export const getReserveAlertsChannel = (client: Client) => {
  return client.channels.cache.get(RESERVE_ALERTS_CHANNEL_ID) as TextChannel
}
export const getHelpDeskChannel = (client: Client) => {
  return client.channels.cache.get(HELP_DESK_CHANNEL_ID) as TextChannel
}
