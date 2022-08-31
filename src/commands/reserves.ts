import type * as TDiscord from 'discord.js'
import { EmbedBuilder, userMention } from 'discord.js'

import { RESERVE_ROLE_ID } from '../utils/constants'
import { getActiveReserves, getReservesRoleForCohort } from '../utils/helpers'

export async function removeReservesRole(
  interaction: TDiscord.ChatInputCommandInteraction<TDiscord.CacheType>,
  categoryChannel: TDiscord.CategoryChannel
) {
  const options = await extractOptions(interaction, categoryChannel)
  if (!options) return
  const { reservesRoleId, member, cohortName } = options

  if (!hasReservesRole(member, reservesRoleId)) {
    await interaction.reply(
      `You don't have the reserves role for ${cohortName} anyway 🤷`
    )
    return
  } else {
    await member.roles.remove(reservesRoleId)
    await interaction.reply(
      `You have been dismissed from the reserve for ${cohortName}. 💌`
    )
  }
}

export async function addReservesRole(
  interaction: TDiscord.ChatInputCommandInteraction<TDiscord.CacheType>,
  categoryChannel: TDiscord.CategoryChannel
) {
  const options = await extractOptions(interaction, categoryChannel)
  if (!options) return
  const { reservesRoleId, member, cohortName } = options

  if (hasReservesRole(member, reservesRoleId)) {
    await interaction.reply(
      `You are already part of the ${cohortName} reserves. 🪖`
    )
  } else {
    await member.roles.add(reservesRoleId)
    await interaction.reply(`Welcome to the reserve for ${cohortName}! 🥳`)
  }
}

export async function toggleReserveRole(
  interaction: TDiscord.ChatInputCommandInteraction<TDiscord.CacheType>,
  categoryChannel: TDiscord.CategoryChannel
) {
  const options = await extractOptions(interaction, categoryChannel)
  if (!options) return
  const { reservesRoleId, member, cohortName } = options

  if (hasReservesRole(member, reservesRoleId)) {
    await member.roles.remove(reservesRoleId)
    await interaction.reply(
      `You have been dismissed from the reserve for ${cohortName}. 💌`
    )
    return
  } else {
    await member.roles.add(reservesRoleId)
    await interaction.reply(`Welcome to the reserve for ${cohortName}! 🥳`)
    return
  }
}

async function extractOptions(
  interaction: TDiscord.ChatInputCommandInteraction<TDiscord.CacheType>,
  categoryChannel: TDiscord.CategoryChannel
) {
  const cohortOption = interaction.options.getString('cohort')
  const reservesRoleId = determineReservesRoleId(cohortOption, categoryChannel)

  if (!reservesRoleId) {
    await interaction.reply(
      'Something went wrong parsing your command... This is awkward'
    )
    return
  }
  const member = interaction.member as TDiscord.GuildMember

  const cohortName =
    cohortOption ?? categoryChannel.name.toLowerCase().split(' ')[0]

  return { reservesRoleId, member, cohortName }
}

function determineReservesRoleId(
  cohortOption: string | null,
  categoryChannel: TDiscord.CategoryChannel
) {
  if (!cohortOption)
    return getReservesRoleForCohort(categoryChannel)?.id ?? null

  if (cohortOption === 'backup') return RESERVE_ROLE_ID

  return (
    categoryChannel.guild.roles.cache.find(
      (r) => r.name === `${cohortOption}-reserves`
    )?.id ?? null
  )
}

function hasReservesRole(
  member: TDiscord.GuildMember,
  roleId: TDiscord.Role['id'] = RESERVE_ROLE_ID
) {
  return member.roles.cache.some((role) => role.id === roleId)
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
