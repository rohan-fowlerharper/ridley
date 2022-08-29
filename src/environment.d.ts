/* eslint-disable no-unused-vars */
// overrides for .env variables and NODE_ENV
declare global {
  declare namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'
      BOT_TOKEN: string
      APP_ID: string
      UNRESOLVED_TIME_THRESHOLD: string
      UNRESOLVED_MESSAGE_THRESHOLD: string
      POLLING_INTERVAL: string
    }
  }
}

export {}
