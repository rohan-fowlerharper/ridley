import * as dotenv from 'dotenv'
import invariant from 'tiny-invariant'

export default function load() {
  dotenv.config({
    path:
      process.env.NODE_ENV === 'production'
        ? '.env.production'
        : '.env.development',
  })

  const requiredEnvs = [
    'BOT_TOKEN',
    'APP_ID',
    'UNRESOLVED_TIME_THRESHOLD',
    'UNRESOLVED_MESSAGE_THRESHOLD',
    'POLLING_INTERVAL',
  ]
  for (const env of requiredEnvs) {
    invariant(process.env[env], `${env} is required`)
  }

  const numberEnvs = [
    'UNRESOLVED_TIME_THRESHOLD',
    'UNRESOLVED_MESSAGE_THRESHOLD',
    'POLLING_INTERVAL',
  ]
  for (const env of numberEnvs) {
    if (isNaN(parseInt(process.env[env] ?? ''))) {
      throw new Error(`${env} must be a number`)
    }
  }
}
