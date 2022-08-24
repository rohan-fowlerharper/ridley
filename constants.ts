export const DAA_SERVER_ID = '690141234596937780'
export const RESERVE_ROLE_ID = '1009586205832269938'
export const HELP_DESK_NAME = 'mock-help-desk' // or mock-help-desk for dev
export const RESERVE_ALERTS_NAME = 'reserve-alerts'

export const MANAIA_CATEGORY_ID = '999052406870507592'
export const PIKOPIKO_CATEGORY_ID = '996201776665591919'
export const CATEGORY_IDS = [MANAIA_CATEGORY_ID, PIKOPIKO_CATEGORY_ID]

export const FACILITATOR_ROLES = [
  'dev academy staff',
  'facilitators-all-campuses',
  'online-facilitators',
  'wellington-facilitators',
  'auckland-facilitators',
]

// time before unresolved messages are sent to reserves
export const UNRESOLVED_TIME_THRESHOLD = 1000 * 60 * 7 // 7 minutes
// number of unresolved messages before they are sent to reserves
export const UNRESOLVED_MESSAGE_THRESHOLD = 3 // 3
// check for unresolved messages every X ms
export const POLLING_INTERVAL = 1000 * 30 // 30 seconds
