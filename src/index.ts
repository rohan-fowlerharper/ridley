import loadEnv from './utils/load-env'
import { start } from './start'

export default async function main() {
  loadEnv()
  await start()
}

loadEnv()

start().catch((err) => {
  process.exit(1)
  console.error(err)
})
