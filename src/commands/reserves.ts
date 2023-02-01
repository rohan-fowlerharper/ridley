import type * as TDiscord from 'discord.js'
import { EmbedBuilder } from 'discord.js'

import { RESERVE_ROLE_ID } from '../utils/constants'
import {
  getActiveReserves,
  makeListEmbedFields,
  toTitleCase,
} from '../utils/helpers'

const actions = {
  add: async ({
    member,
    reservesRoleId,
    facilitatorRoleId,
    cohortName,
  }: {
    member: TDiscord.GuildMember
    reservesRoleId: string
    facilitatorRoleId: string
    cohortName: string
  }) => {
    await member.roles.remove(facilitatorRoleId)
    await member.roles.add(reservesRoleId)
    return `Welcome to the reserves for ${toTitleCase(cohortName)}! 🥳`
  },
  remove: async ({
    member,
    reservesRoleId,
    cohortName,
    facilitatorRoleId,
  }: {
    member: TDiscord.GuildMember
    reservesRoleId: string
    facilitatorRoleId: string
    cohortName: string
  }) => {
    await member.roles.add(facilitatorRoleId)
    await member.roles.remove(reservesRoleId)
    return `You have been dismissed from the reserve for ${toTitleCase(
      cohortName
    )}. 💌`
  },
}

export async function removeReservesRole(
  interaction: TDiscord.ChatInputCommandInteraction<TDiscord.CacheType>,
  categoryChannel: TDiscord.CategoryChannel
) {
  const options = await extractOptions(interaction, categoryChannel)
  if (!options) return
  const { reservesRoleId, member, cohortName, facilitatorRoleId } = options

  let response: string
  if (!hasReservesRole(member, reservesRoleId)) {
    response = `You don't have the reserves role for ${toTitleCase(
      cohortName
    )} anyway 🤷`
  } else {
    response = await actions.remove(options)
  }

  await interaction.reply(response)
}

export async function addReservesRole(
  interaction: TDiscord.ChatInputCommandInteraction<TDiscord.CacheType>,
  categoryChannel: TDiscord.CategoryChannel
) {
  const options = await extractOptions(interaction, categoryChannel)
  if (!options) return
  const { reservesRoleId, member, cohortName } = options

  let response: string
  if (hasReservesRole(member, reservesRoleId)) {
    response = `You are already part of the ${toTitleCase(
      cohortName
    )} reserves. 🪖`
  } else {
    response = await actions.add(options)
  }

  await interaction.reply(response)
}

export async function toggleReserveRole(
  interaction: TDiscord.ChatInputCommandInteraction<TDiscord.CacheType>,
  categoryChannel: TDiscord.CategoryChannel
) {
  const options = await extractOptions(interaction, categoryChannel)
  if (!options) return
  const { reservesRoleId, member } = options

  let response: string
  if (hasReservesRole(member, reservesRoleId)) {
    response = await actions.remove(options)
  } else {
    response = await actions.add(options)
  }

  await interaction.reply(response)
}

async function extractOptions(
  interaction: TDiscord.ChatInputCommandInteraction<TDiscord.CacheType>,
  categoryChannel: TDiscord.CategoryChannel
) {
  const cohortName =
    interaction.options.getString('cohort') ??
    categoryChannel.name.toLowerCase().split(' ').at(-2)!
  const reservesRoleId = determineReservesRoleId(cohortName, categoryChannel)
  const facilitatorRoleId = determineFacilitatorRoleId(
    cohortName,
    categoryChannel
  )

  if (!reservesRoleId) {
    await interaction.reply(
      'Something went wrong parsing your command... This is awkward'
    )
    return
  }
  const member = interaction.member as TDiscord.GuildMember

  return { reservesRoleId, facilitatorRoleId, member, cohortName }
}

function determineReservesRoleId(
  cohortOption: string,
  categoryChannel: TDiscord.CategoryChannel
) {
  if (cohortOption === 'backup') return RESERVE_ROLE_ID

  return categoryChannel.guild.roles.cache.find(
    (r) => r.name === `${cohortOption}-reserves`
  )!.id
}

function determineFacilitatorRoleId(
  cohortOption: string,
  categoryChannel: TDiscord.CategoryChannel
) {
  return categoryChannel.guild.roles.cache.find(
    (r) => r.name === `${cohortOption}-facilitators`
  )!.id
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

  const fields = makeListEmbedFields(reserves)

  const embed = new EmbedBuilder()
    .setTitle('Here are the currently active reserves 🪖')
    .addFields(fields)
    .setColor('#e91e63')

  await interaction.reply({ embeds: [embed] })
}
