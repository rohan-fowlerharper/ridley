import loadEnv from './utils/load-env'
import { start } from './start'

loadEnv()

start().catch((err) => {
  console.error(err)
  process.exit(1)
})
