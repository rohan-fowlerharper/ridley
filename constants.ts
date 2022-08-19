export const DAA_SERVER_ID = '690141234596937780'
export const RESERVE_ALERTS_CHANNEL_ID = '1009585830848909373'
export const HELP_DESK_CHANNEL_ID = '1009592156819816500'
export const RESERVE_ROLE_ID = '1009586205832269938'

// time before unresolved messages are sent to reserves
export const UNRESOLVED_TIME_THRESHOLD = 5000 // ms
// number of unresolved messages before they are sent to reserves
export const UNRESOLVED_MESSAGE_THRESHOLD = 3
// check for unresolved messages every X ms
// I think this should be 1min < x < 5min in reality
export const POLLLING_INTERVAL = 5000 // ms
