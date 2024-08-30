import axios from 'axios'
import { env } from './environments'
import { ClickerHeroes } from './types/clickerHeroesTypes'

const apiInstance = axios.create({
  baseURL: 'https://guilds.clickerheroes.com/',
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

export const getGuildInfo = (): Promise<ClickerHeroes.GuildInfo> => {
  return apiInstance.post('/clans/getGuildInfo.php')
}

export const getRaidData = (day: 'today'|'yesterday' = 'today'): Promise<ClickerHeroes.RaidInfo> => {
  return apiInstance.post('clans/getNewRaid.php', {
    day,
    timeStamp: Math.round(Date.now() / 1000),
    guildName: env.CLICKER_HEROES_CLAN_NAME,
  })
}
