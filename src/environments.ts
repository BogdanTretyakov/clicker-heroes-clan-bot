import dotenv from 'dotenv'

const keys = [
  'CLICKER_HEROES_CLAN_NAME',
  'CLICKER_HEROES_UID',
  'CLICKER_HEROES_PASSWORD_HASH',
  'DISCORD_BOT_TOKEN',
  'DISCORD_GUILD_ID',
  'DISCORD_CHANNEL_ID',
  'DISCORD_APPLICATION_ID',
] as const

// @ts-expect-error
const processEnv: Record<typeof keys[number], string> = {}

dotenv.config({ processEnv })

const isLostConfig = keys.some((key => !(key in processEnv) || !processEnv[key]))

if (isLostConfig) {
  throw new Error('No config')
}

export { processEnv as env }
