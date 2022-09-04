import 'dotenv/config'
import invariant from 'tiny-invariant'

const {
  BOT_TOKEN,
  APP_ID,
  UNRESOLVED_MESSAGE_THRESHOLD,
  UNRESOLVED_TIME_THRESHOLD,
} = process.env

invariant(BOT_TOKEN, 'BOT_TOKEN is required')
invariant(APP_ID, 'APP_ID is required')

import config from '../bot.config'
const env = process.env.NODE_ENV || 'development'
console.log(config[env])

console.log(BOT_TOKEN)
console.log(UNRESOLVED_MESSAGE_THRESHOLD)
console.log(UNRESOLVED_TIME_THRESHOLD)
