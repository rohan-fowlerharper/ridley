import { Client } from 'discord.js'
import { TextChannel } from 'discord.js'
import { RESERVE_ALERTS_CHANNEL_ID, HELP_DESK_CHANNEL_ID } from './constants'

export const getReserveAlertsChannel = (client: Client) => {
  return client.channels.cache.get(RESERVE_ALERTS_CHANNEL_ID) as TextChannel
}
const getHelpDeskChannel = (client: Client) => {
  return client.channels.cache.get(HELP_DESK_CHANNEL_ID) as TextChannel
}
