import type * as TDiscord from 'discord.js'

// TODO: derive these from generated file/config
const AHOAHO_CATEGORY_ID = '1025348254411538442'
const POPOTO_CATEGORY_ID = '1024418527270154320'
// const PIKOPIKO_CATEGORY_ID = '996201776665591919'
// const MANAIA_CATEGORY_ID = '999052406870507592'
const AIHE_TEST_CATEGORY_ID = '1015434245235281940'

export default {
  production: {
    GUILD_ID: process.env.GUILD_ID,
    BOT_TOKEN: process.env.BOT_TOKEN,
    HELP_DESK_NAME: 'help-desk',
    RESERVE_ALERTS_NAME: 'reserve-alerts',
    CATEGORY_IDS: [AHOAHO_CATEGORY_ID, POPOTO_CATEGORY_ID],
    ROLE_ID_BACKUP_RESERVES: '1009586205832269938',
    THRESHOLDS: {
      UNRESOLVED_TIME: 1000 * 60 * 7, // 7 minutes
      UNRESOLVED_MESSAGES: 3,
      POLLING_INTERVAL: 1000 * 30, // 30 seconds
    },
  },
  staging: {
    GUILD_ID: process.env.GUILD_ID,
    BOT_TOKEN: process.env.BOT_TOKEN,
    HELP_DESK_NAME: 'mock-help-desk',
    RESERVE_ALERTS_NAME: 'reserve-alerts',
    CATEGORY_IDS: [AHOAHO_CATEGORY_ID, POPOTO_CATEGORY_ID],
    ROLE_ID_BACKUP_RESERVES: '1009586205832269938',
    THRESHOLDS: {
      UNRESOLVED_TIME: 1000 * 5, // 5 seconds
      UNRESOLVED_MESSAGES: 0,
      POLLING_INTERVAL: 1000 * 5, // 5 seconds
    },
  },
  development: {
    GUILD_ID: process.env.TEST_GUILD_ID,
    BOT_TOKEN: process.env.TEST_BOT_TOKEN,
    HELP_DESK_NAME: 'help-desk',
    RESERVE_ALERTS_NAME: 'reserve-alerts',
    CATEGORY_IDS: [AIHE_TEST_CATEGORY_ID],
    ROLE_ID_BACKUP_RESERVES: '1015801848336228392',
    THRESHOLDS: {
      UNRESOLVED_TIME: 1000 * 5, // 5 seconds
      UNRESOLVED_MESSAGES: 0,
      POLLING_INTERVAL: 1000 * 5, // 5 seconds
    },
  },
} as { [key: string]: Config }

type Config = {
  GUILD_ID: TDiscord.Guild['id']
  BOT_TOKEN: string
  HELP_DESK_NAME: 'help-desk' | 'mock-help-desk'
  RESERVE_ALERTS_NAME: 'reserve-alerts' | 'mock-reserve-alerts'
  ROLE_ID_BACKUP_RESERVES: TDiscord.Role['id']
  CATEGORY_IDS: TDiscord.CategoryChannel['id'][]
  THRESHOLDS: {
    UNRESOLVED_TIME: number
    UNRESOLVED_MESSAGES: number
    POLLING_INTERVAL: number
  }
}
