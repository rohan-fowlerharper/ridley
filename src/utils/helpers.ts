import {
  channelMention,
  ChannelType,
  EmbedBuilder,
  roleMention,
} from 'discord.js'

import { CATEGORY_IDS, FACILITATOR_ROLES } from './constants'
import { getChannelById, getReserveAlertsChannel } from './get-channels'

import type {
  HelpMessage,
  UnresolvedMessagesForCategory,
  MessageStatus,
  UnresolvedMessages,
} from '../types'
import type * as TDiscord from 'discord.js'

export const isActiveCohort = (categoryChannel: TDiscord.CategoryChannel) =>
  CATEGORY_IDS.includes(categoryChannel.id)

export const isFacilitator = (member: TDiscord.GuildMember) => {
  return member?.roles.cache.some((role) =>
    FACILITATOR_ROLES.includes(role.name)
  )
}

export const hasBeenWaitingWithoutReaction = (message: HelpMessage) =>
  Date.now() - message.createdTimestamp >
    +process.env.UNRESOLVED_TIME_THRESHOLD && message.reactions.cache.size === 0

export const isNewMessageWithoutReaction = (
  messages: UnresolvedMessagesForCategory
) =>
  getNumberOfUnresolvedMessages(messages) >
  +process.env.UNRESOLVED_MESSAGE_THRESHOLD

export const getNumberOfUnresolvedMessages = (
  messages: UnresolvedMessagesForCategory
) => filterMessagesByStatus(messages, 'unresolved').size

export const filterMessagesByStatus = (
  messages: UnresolvedMessagesForCategory,
  status: MessageStatus
): UnresolvedMessagesForCategory =>
  new Map([...messages].filter(([, m]) => m.status === status))

export async function checkForUnresolvedMessages(
  client: TDiscord.Client,
  messages: UnresolvedMessages
) {
  for (const [categoryId, unresolvedCategoryMessages] of messages) {
    const categoryChannel = getChannelById<TDiscord.CategoryChannel>(
      client,
      categoryId
    )
    for (const [id, message] of unresolvedCategoryMessages) {
      if (
        (hasBeenWaitingWithoutReaction(message) ||
          isNewMessageWithoutReaction(unresolvedCategoryMessages)) &&
        message.status === 'unresolved'
      ) {
        sendMessageToReserves(categoryChannel, message)
        message.status = 'sentToLocalReserve'
      }
      // delete message if in cache for more than an hour
      const CACHE_TIMEOUT = 1000 * 60 * 60
      if (Date.now() - message.createdTimestamp > CACHE_TIMEOUT) {
        unresolvedCategoryMessages.delete(id)
      }
    }
    console.log({
      cohort: categoryChannel.name,
      unresolved: getNumberOfUnresolvedMessages(unresolvedCategoryMessages),
      sentLocal: filterMessagesByStatus(
        unresolvedCategoryMessages,
        'sentToLocalReserve'
      ).size,
    })
  }
}

export function getReservesRoleForCohort(
  categoryChannel: TDiscord.CategoryChannel
) {
  const cohort = categoryChannel.name.toLowerCase().split(' ')[0]
  const roleName = `${cohort}-reserves`
  const role = categoryChannel.guild.roles.cache.find(
    (r) => r.name === roleName
  )
  return role
}

export async function sendMessageToReserves(
  categoryChannel: TDiscord.CategoryChannel,
  message: HelpMessage
) {
  const reserveAlertsChannel = getReserveAlertsChannel(categoryChannel)
  let voiceChannel: TDiscord.VoiceChannel | undefined

  if (message.mentions.channels.size > 0) {
    voiceChannel = message.mentions.channels.find(
      (c) => c.type === ChannelType.GuildVoice
    ) as TDiscord.VoiceChannel | undefined
  }

  const reservesRole = getReservesRoleForCohort(categoryChannel)
  if (!reservesRole) return

  let response = `${roleMention(reservesRole.id)}`

  if (voiceChannel) {
    response += ` ${channelMention(voiceChannel.id)}`
  }

  response += '\n'

  const embed = new EmbedBuilder()
    .setDescription(`>>> ${message.content}`)
    .setAuthor({
      name: message.author.username,
      iconURL: message.author.displayAvatarURL(),
    })
    .addFields(
      { name: 'Message ID', value: message.id, inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      {
        name: 'Time',
        value: `${Math.ceil(
          (Date.now() - message.createdTimestamp) / 1000
        )}s ago`,
        inline: true,
      }
    )
    .setTimestamp(message.createdTimestamp)
    .setColor('#e91e63')

  const sentMessage = await reserveAlertsChannel.send({
    embeds: [embed],
    content: response,
  })

  message.dispatchedMessageId = sentMessage.id
}

type ValidChannel = {
  isValid: true
  channel: TDiscord.TextChannel
  categoryChannel: TDiscord.CategoryChannel
}
type InvalidChannel = {
  isValid: false
  channel: null
  categoryChannel: null
}
export const validateChildChannel = (
  channel: TDiscord.Channel | undefined
): ValidChannel | InvalidChannel => {
  const invalidChannel: InvalidChannel = {
    isValid: false,
    channel: null,
    categoryChannel: null,
  }
  if (!channel) return invalidChannel

  if (channel.type !== ChannelType.GuildText) return invalidChannel

  const categoryChannel = channel.parent

  if (!categoryChannel) return invalidChannel

  return { isValid: true, channel, categoryChannel }
}

export function resolveMessage(
  messages: UnresolvedMessagesForCategory,
  messageId: HelpMessage['id']
) {
  const message = messages.get(messageId)
  if (message) {
    message.status = 'resolved'
  }
}

export async function getActiveReserves(guild: TDiscord.Guild) {
  const members = await guild.members.fetch()
  const roles = guild.roles.cache.filter((r) => r.name.includes('reserves'))

  return roles.map((r) => ({
    role: r,
    members: members.filter((m) => m.roles.cache.has(r.id)),
  }))
}

export function makeListEmbedFields(
  reserves: Awaited<ReturnType<typeof getActiveReserves>>
) {
  return reserves.map(({ role, members }) => ({
    name: role.name,
    value: members.map((m) => m.user).join(' '),
  }))
}
