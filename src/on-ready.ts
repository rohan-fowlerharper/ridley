import type * as TDiscord from 'discord.js'
import { EmbedBuilder } from 'discord.js'
import { DAA_SERVER_ID, MANAIA_CATEGORY_ID } from './utils/constants'
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
      status: 'idle',
    })

    const manaiaCategoryChannel = getChannelById<TDiscord.CategoryChannel>(
      client,
      MANAIA_CATEGORY_ID
    )

    if (!manaiaCategoryChannel) return

    const reserveAlertsChannel = getReserveAlertsChannel(manaiaCategoryChannel)

    if (process.env.NODE_ENV !== 'production') {
      void reserveAlertsChannel.send('Bot started in Development mode')

      checkEvery(+process.env.POLLING_INTERVAL)
      return
    }

    const reserves = await getActiveReserves(
      client.guilds.cache.get(DAA_SERVER_ID)!
    )

    const fields = makeListEmbedFields(reserves)

    const embed = new EmbedBuilder()
      .setTitle('Here are the currently active reserves 🪖')
      .addFields(fields)
      .setColor('#e91e63')

    void reserveAlertsChannel.send({
      content: `Reserver Alerter started`,
      embeds: [embed],
    })
    checkEvery(+process.env.POLLING_INTERVAL)
  })

  const checkEvery = (ms: number) => {
    setInterval(async () => {
      await checkForUnresolvedMessages(client, unresolvedMessages)
    }, ms || 1000)
  }
}
