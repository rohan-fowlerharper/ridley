import configs from '../../bot.config'

// TODO: tidy this up to only use the config file
// instead of re-exporting everything here
export const env = process.env.NODE_ENV || 'development'
export const config = configs[env]

export const DAA_SERVER_ID = config.GUILD_ID
export const RESERVE_ROLE_ID = config.ROLE_ID_BACKUP_RESERVES
export const HELP_DESK_NAME = config.HELP_DESK_NAME
export const RESERVE_ALERTS_NAME = config.RESERVE_ALERTS_NAME

export const CATEGORY_IDS = config.CATEGORY_IDS

export const FACILITATOR_ROLES = [
  'dev academy staff',
  'facilitators-all-campuses',
  'online-facilitators',
  'wellington-facilitators',
  'auckland-facilitators',
]
