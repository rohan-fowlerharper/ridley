import { Client, GatewayIntentBits, Partials } from 'discord.js'
import { CATEGORY_IDS } from './utils/constants'

import * as reactions from './reactions'
import * as messages from './messages'
import * as interactions from './interactions'

import * as ready from './on-ready'

import type { UnresolvedMessages } from './types'

export async function start() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  })

  /**
   * stores unresolved messages in a map of categoryId -> messageId -> message
   * like an array of unresolved messages for each cohort (indexed by categoryId, and then messageId)
   */
  const unresolvedMessages = new Map(
    CATEGORY_IDS.map((c) => [c, new Map()])
  ) as UnresolvedMessages

  reactions.setup(client, unresolvedMessages)

  messages.setup(client, unresolvedMessages)

  interactions.setup(client)

  ready.setup(client, unresolvedMessages)

  client.login(process.env.BOT_TOKEN)
}
