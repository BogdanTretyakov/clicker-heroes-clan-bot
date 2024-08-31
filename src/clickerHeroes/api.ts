import axios, { RawAxiosRequestHeaders } from 'axios'
import { env } from '../environments'
import { GuildInfo, RaidInfo } from './types'
import { getCurrentTimestamp } from '../utils/datetime'

const headers: RawAxiosRequestHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'cache-control': 'no-cache',
  'accept': '*/*',
  'origin': 'https://cdn.clickerheroes.com',
  'referer': 'https://cdn.clickerheroes.com/',
  'pragma': 'no-cache',
}

const apiInstance = axios.create({
  baseURL: 'https://guilds.clickerheroes.com/',
  headers,
})

apiInstance.interceptors.request.use((config) => {
  if (!['post', 'POST'].includes(config.method!)) {
    return config
  }

  if (!(config.data instanceof FormData)) {
    const formData = new FormData()
    if (!!config.data) {
      Object.entries(config.data).forEach(([key, value]) => formData.set(key, String(value)))
    }
    config.data = formData
  }

  config.data.set('uid', env.CLICKER_HEROES_UID)
  config.data.set('passwordHash', env.CLICKER_HEROES_PASSWORD_HASH)

  return config
})

apiInstance.interceptors.response.use((resp) => {
  if (!resp.data.success) {
    throw new Error(resp.data)
  }
  return resp.data.result
})

const getGuildInfo = (): Promise<GuildInfo> => {
  return apiInstance.post('/clans/getGuildInfo.php')
}

const getRaidData = (day: 'today'|'yesterday' = 'today'): Promise<RaidInfo> => {
  return apiInstance.post('clans/getNewRaid.php', {
    day,
    timeStamp: Math.round(Date.now() / 1000),
    guildName: env.CLICKER_HEROES_CLAN_NAME,
  })
}

const doBossDamage = (damageDone: string, level: string, isBonus = false): Promise<void> => {
  return apiInstance.post('/clans/sendNewImmortalDamage.php', {
    day: 'today',
    guildName: env.CLICKER_HEROES_CLAN_NAME,
    damageDone,
    timestamp: getCurrentTimestamp(),
    level,
    isBonusFight: isBonus ? 'true' : ''
  })
}

const buyBonusFight = (): Promise<void> => {
  return apiInstance.post('/clans/requestBonusFight.php', {
    timestamp: getCurrentTimestamp(),
    day: 'today',
    guildName: env.CLICKER_HEROES_CLAN_NAME,
  })
}

export const clickerHeroesApi = {
  getGuildInfo,
  getRaidData,
  doBossDamage,
  buyBonusFight,
}
