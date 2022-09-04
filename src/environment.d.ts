/* eslint-disable no-unused-vars */
// overrides for .env variables and NODE_ENV
declare global {
  declare namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test' | 'staging'
      BOT_TOKEN: string
      APP_ID: string
      GUILD_ID: string
      TEST_BOT_TOKEN: string
      TEST_APP_ID: string
      TEST_GUILD_ID: string
    }
  }
}

export {}
