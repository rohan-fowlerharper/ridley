import 'dotenv/config'

import loadEnv from '../src/utils/load-env'

loadEnv()

import config from '../bot.config'
const env = process.env.NODE_ENV || 'development'

console.log(config[env])
