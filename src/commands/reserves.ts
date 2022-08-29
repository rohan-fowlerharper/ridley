import type * as TDiscord from 'discord.js'
import { EmbedBuilder, userMention } from 'discord.js'

import { RESERVE_ROLE_ID } from '../utils/constants'
import { getActiveReserves } from '../utils/helpers'

export async function removeReservesRole(
  interaction: TDiscord.ChatInputCommandInteraction<TDiscord.CacheType>
) {
  const member = interaction.member as TDiscord.GuildMember
  if (!hasReservesRole(member)) {
    await interaction.reply("You don't have the reserves role")
    return
  } else {
    await member.roles.remove(RESERVE_ROLE_ID)
    await interaction.reply('You have been dismissed from the reserve. 💌')
  }
}

export async function addReservesRole(
  interaction: TDiscord.ChatInputCommandInteraction<TDiscord.CacheType>
) {
  const member = interaction.member as TDiscord.GuildMember
  if (hasReservesRole(member)) {
    await interaction.reply('You already have the reserves role 🪖')
  } else {
    await member.roles.add(RESERVE_ROLE_ID)
    await interaction.reply('Welcome to the reserve! 🥳')
  }
}

export async function toggleReserveRole(
  interaction: TDiscord.ChatInputCommandInteraction<TDiscord.CacheType>
) {
  const member = interaction.member as TDiscord.GuildMember
  if (hasReservesRole(member)) {
    await member.roles.remove(RESERVE_ROLE_ID)
    await interaction.reply('You have been dismissed from the reserve. 💌')
    return
  } else {
    await member.roles.add(RESERVE_ROLE_ID)
    await interaction.reply('Welcome to the reserve! 🥳')
    return
  }
}

function hasReservesRole(member: TDiscord.GuildMember) {
  return member.roles.cache.some((role) => role.id === RESERVE_ROLE_ID)
}

export async function listReserves(
  interaction: TDiscord.ChatInputCommandInteraction<TDiscord.CacheType>
) {
  const reserves = await getActiveReserves(interaction.guild as TDiscord.Guild)
  const embed = new EmbedBuilder()
    .setTitle('Here are the currently active reserves 🪖')
    .addFields(
      {
        name: 'Active Reserves:',
        value: reserves.size
          ? reserves.map((r) => userMention(r.user.id)).join(', ')
          : 'None',
      },
      {
        name: 'Total:',
        value: reserves.size.toString(),
      }
    )
    .setColor('#e91e63')
  await interaction.reply({ embeds: [embed] })
}
