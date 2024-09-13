import dotenv from 'dotenv'

const keys = [
  'DISCORD_BOT_TOKEN',
  'DISCORD_APPLICATION_ID',
] as const

dotenv.config()

const isLostConfig = keys.some((key => !(key in process.env) || !process.env[key]))

if (isLostConfig) {
  throw new Error('No config')
}

export const env = {
  DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN ?? '',
  DISCORD_APPLICATION_ID: process.env.DISCORD_APPLICATION_ID ?? '',
  DISCORD_ADMINS_ID: (process.env.DISCORD_ADMINS_ID ?? '').split(' ')
}
