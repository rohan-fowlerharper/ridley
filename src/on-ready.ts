import type * as TDiscord from 'discord.js'
import { EmbedBuilder } from 'discord.js'
import { config, DAA_SERVER_ID, env } from './utils/constants'
import { getChannelById, getReserveAlertsChannel } from './utils/get-channels'
import {
  checkForUnresolvedMessages,
  getActiveReserves,
  makeListEmbedFields,
} from './utils/helpers'
import type { UnresolvedMessages } from './types'

export async function setup(
  client: TDiscord.Client,
  unresolvedMessages: UnresolvedMessages
) {
  client.once('ready', async (client) => {
    console.log(`ready as ${client.user?.tag} at ${client.readyAt}`)

    // lol
    client.user?.setPresence({
      activities: [{ name: 'deploying reserves...' }],
      status: 'online',
    })

    const channels = config.CATEGORY_IDS.map((categoryId) => {
      const category = getChannelById(
        client,
        categoryId
      ) as TDiscord.CategoryChannel

      if (!category) return undefined
      const reserveAlertsChannel = getReserveAlertsChannel(category)
      return reserveAlertsChannel
    }).filter(Boolean) as TDiscord.TextChannel[]

    if (env === 'development') {
      channels.forEach((c) => c.send('Bot started in Development mode'))
    } else if (env === 'staging') {
      channels.forEach((c) => c.send('Bot started in Staging mode'))
    } else {
      const reserves = await getActiveReserves(
        client.guilds.cache.get(DAA_SERVER_ID)!
      )

      const fields = makeListEmbedFields(reserves)

      const embed = new EmbedBuilder()

      embed.setTitle('Here are the currently active reserves 🪖')
      embed.addFields(fields)
      embed.setColor('#e91e63')

      channels.forEach((channel) => {
        void channel.send({
          content: `Lt. Ridley reporting for duty ⛑️`,
          embeds: [embed],
        })
      })
    }

    checkEvery(config.THRESHOLDS.POLLING_INTERVAL)
  })

  const checkEvery = (ms: number) => {
    setInterval(async () => {
      await checkForUnresolvedMessages(client, unresolvedMessages)
    }, ms || 1000)
  }
}
