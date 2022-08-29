import type * as TDiscord from 'discord.js'
import { channelMention, ChannelType } from 'discord.js'
import { RESERVE_ALERTS_NAME } from '../utils/constants'
import { getReserveAlertsChannel } from '../get-channels'
import { isFacilitator } from '../utils/helpers'
import * as cmd from '../commands/reserves'

export async function setup(client: TDiscord.Client) {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return
    if (interaction.channel?.type !== ChannelType.GuildText) return

    const channel = interaction.channel
    const categoryChannel = channel.parent

    if (!categoryChannel) {
      await interaction.reply("Wait... This channel isn't in a cohort 🤔")
      return
    }

    const reserveAlertsChannel = getReserveAlertsChannel(categoryChannel)

    if (channel.name !== RESERVE_ALERTS_NAME) {
      await interaction.reply(
        `These are not the channels you're looking for 🤖. Try ${channelMention(
          reserveAlertsChannel.id
        )}`
      )
      return
    }

    const member = interaction.member as TDiscord.GuildMember

    if (!isFacilitator(member)) {
      await interaction.reply('Wait... you need to be a facilitator to do that')
      return
    }

    if (interaction.commandName === 'reserves') {
      try {
        switch (interaction.options.getSubcommand()) {
          case 'list':
            await cmd.listReserves(interaction)
            break
          case 'toggle':
            await cmd.toggleReserveRole(interaction)
            break
          case 'join':
            await cmd.addReservesRole(interaction)
            break
          case 'leave':
            await cmd.removeReservesRole(interaction)
        }
      } catch (err) {
        console.error(err)
        await interaction.reply(
          'Argh, Bananas and Ferarris! Something happened.'
        )
      }
    }
  })
}
