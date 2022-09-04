import 'dotenv/config'
import invariant from 'tiny-invariant'

export default function load() {
  const validEnvs = ['development', 'production', 'staging']
  const env = process.env.NODE_ENV || 'development'

  if (!validEnvs.includes(env)) {
    throw new Error(`Invalid NODE_ENV: ${env}`)
  }

  const requiredEnvs = process.env.NODE_ENV
    ? ['BOT_TOKEN', 'APP_ID', 'GUILD_ID']
    : ['TEST_BOT_TOKEN', 'TEST_APP_ID', 'TEST_GUILD_ID']

  for (const env of requiredEnvs) {
    invariant(process.env[env], `${env} is required`)
  }
}
