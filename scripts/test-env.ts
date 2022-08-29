import * as dotenv from 'dotenv'
import invariant from 'tiny-invariant'

dotenv.config({
  path:
    process.env.NODE_ENV === 'production'
      ? '.env.production'
      : '.env.development',
})
const {
  BOT_TOKEN,
  APP_ID,
  UNRESOLVED_MESSAGE_THRESHOLD,
  UNRESOLVED_TIME_THRESHOLD,
} = process.env

invariant(BOT_TOKEN, 'BOT_TOKEN is required')
invariant(APP_ID, 'APP_ID is required')

console.log(BOT_TOKEN)
console.log(UNRESOLVED_MESSAGE_THRESHOLD)
console.log(UNRESOLVED_TIME_THRESHOLD)
