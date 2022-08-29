import type * as TDiscord from 'discord.js'

export type MessageStatus =
  | 'unresolved'
  | 'sentToLocalReserve'
  | 'sentToGlobalReserve'
  | 'resolved'

export type HelpMessage = Pick<
  TDiscord.Message,
  | 'createdTimestamp'
  | 'id'
  | 'channelId'
  | 'content'
  | 'author'
  | 'reactions'
  | 'mentions'
> & {
  status: MessageStatus
  dispatchedMessageId?: string
}

export type UnresolvedMessagesForCategory = Map<HelpMessage['id'], HelpMessage>
export type UnresolvedMessages = Map<
  TDiscord.CategoryChannel['id'],
  UnresolvedMessagesForCategory
>
