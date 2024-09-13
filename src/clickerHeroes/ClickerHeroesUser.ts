import axios, { Axios, RawAxiosRequestHeaders } from "axios"
import { ClanMessages, GuildInfo, LegacyRaidInfo, RaidInfo } from "./types"
import { getCurrentTimestamp } from "../utils/datetime"
import type { ClickerHeroesAccountEntity } from "../models"

const headers: RawAxiosRequestHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'cache-control': 'no-cache',
  'accept': '*/*',
  'origin': 'https://cdn.clickerheroes.com',
  'referer': 'https://cdn.clickerheroes.com/',
  'pragma': 'no-cache',
}

export class ClickerHeroesUser {
  private userData!: GuildInfo
  private raidInfo!: RaidInfo


  private constructor(
    public userId: string,
    public passwordHash: string,
    private axios: Axios,
  ) {}

  public static async create(account: ClickerHeroesAccountEntity) {
    const { uid: userId, passwordHash } = account

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

      config.data.set('uid', userId)
      config.data.set('passwordHash', passwordHash)

      return config
    })

    apiInstance.interceptors.response.use((resp) => {
      if (!resp.data.success) {
        throw new Error(resp.data)
      }
      return resp.data.result
    })

    const instance = new this(userId, passwordHash, apiInstance)

    await instance.updateGuildInfo()

    if (instance.guildName) {
      await instance.updateRaidInfo()
    }

    if (account.userName !== instance.userName || account.guildName !== instance.guildName) {
      account.userName = instance.userName
      account.guildName = instance.guildName
      await account.save()
    }

    return instance
  }

  async updateGuildInfo(): Promise<void> {
    this.userData = await this.axios.post('/clans/getGuildInfo.php')
  }

  async updateRaidInfo(): Promise<void> {
    this.checkInClan()

    this.raidInfo = await this.axios.post('clans/getNewRaid.php', {
      day: 'today',
      timeStamp: getCurrentTimestamp(),
      guildName: this.guildName,
    })
  }

  private formatNumber(data: number): string {
    return data < 1e6 ? `${data}` : data.toExponential(15)
  }

  private calculateBossDamage(isBonus = false, isDone = false) {
    const { raid } = this.raidInfo
    if (isDone) {
      return {
        level: raid.level,
        isBonusFight: isBonus ? 'true' : '',
        damageDone: '0',
      }
    }
    const raidLevel = +raid.level
    const scores = isBonus ? raid.bonusScores : raid.scores
    const doneDamage = Object.entries(scores)
      .reduce((acc, [id, value]) => acc + id === this.userId ? 0 : +value, 0)

    const firstMods = [.1, .3, .5, .2, .4, .6]
    const continuousMods = [.7, .3, .5]
    const mod = raidLevel <= 6 ? firstMods[raidLevel-1] : continuousMods[raidLevel % 3]
    const totalHealth = 17500 * mod * 3 ** Math.ceil(raidLevel / 3);
    const remainsHeals = totalHealth - doneDamage
    const userLevel = +this.userData.user.classLevel
    const userDamage = 10 * 3 ** (userLevel - 1)
    const clicks = Math.ceil(remainsHeals / userDamage) + 1;
    const damageDone = this.formatNumber(clicks * userDamage)

    return {
      level: raid.level,
      isBonusFight: isBonus ? 'true' : '',
      damageDone,
    }
  }

  async doBossDamage(): Promise<void> {
    await this.updateRaidInfo()

    const isBonus = this.raidStatus.isBonusAvailable

    const isDone = isBonus ? this.raidStatus.isBonusSuccessful : this.raidStatus.isSuccessful
    const scores = isBonus ? this.raidInfo.raid.bonusScores : this.raidInfo.raid.scores

    if (isDone && this.userId in scores) return

    const requestData = this.calculateBossDamage(isBonus, isDone)

    await this.axios.post('/clans/sendNewImmortalDamage.php', {
      day: 'today',
      guildName: this.guildName,
      timestamp: getCurrentTimestamp(),
      ...requestData
    })

    return this.updateRaidInfo()
  }

  async buyBonusFight(): Promise<void> {
    await this.updateRaidInfo()

    if (!this.raidStatus.isSuccessful || this.raidStatus.isBonusAvailable) return

    await this.axios.post('/clans/requestBonusFight.php', {
      timestamp: getCurrentTimestamp(),
      day: 'today',
      guildName: this.guildName,
    })

    return this.updateRaidInfo()
  }

  getLegacyRaid(): Promise<LegacyRaidInfo> {
    return this.axios.post('/clans/getRaid.php', {
      guildName: this.guildName,
      day: 'today',
      timestamp: getCurrentTimestamp()
    })
  }

  private calculateLegacyBossDamage(levelStarted: number, killCount: number) {
    const levelReached = levelStarted + killCount

    const damageDone = Array.from(
      { length: killCount },
      (_, idx) => levelStarted + idx
    ).reduce(
      (acc, level) => acc + 500 * (2 ** level),
      0
    )

    return {
      levelStarted,
      levelReached,
      damageDone: this.formatNumber(damageDone),
    }
  }

  async doLegacyBossDamage(killCount: number) {
    this.checkInClan()

    const { raid: { isSuccessful, level } } = await this.getLegacyRaid()

    if (isSuccessful) return

    const requestData = this.calculateLegacyBossDamage(Number(level), killCount)

    return this.axios.post('/clans/sendTitanDamage.php', {
      timestamp: getCurrentTimestamp(),
      day: 'today',
      guildName: this.guildName,
      purchasedFight: 0,
      ...requestData,
    })
  }

  acceptGuildRequest(uidToAccept: string): Promise<void> {
    this.checkIsClanLeader()

    return this.axios.post('/clans/acceptGuildRequest.php', {
      timestamp: getCurrentTimestamp(),
      day: 'today',
      guildName: this.guildName,
      uidToAccept,
      guildMasterUid: this.userData.guild?.guildMasterUid
    })
  }

  rejectGuildRequest(uidToReject: string): Promise<void> {
    this.checkIsClanLeader()

    return this.axios.post('/clans/rejectGuildRequest.php', {
      timestamp: getCurrentTimestamp(),
      day: 'today',
      guildName: this.guildName,
      uidToReject,
      guildMasterUid: this.userData.guild?.guildMasterUid
    })
  }

  kickGuildMember(uidToKick: string): Promise<void> {
    this.checkIsClanLeader()

    return this.axios.post('/clans/kickGuildMember.php', {
      timestamp: getCurrentTimestamp(),
      day: 'today',
      guildName: this.guildName,
      uidToKick,
      guildMasterUid: this.userData.guild?.guildMasterUid
    })
  }

  changeGuildMaster(newGuildMasterUid: string): Promise<void> {
    this.checkIsClanLeader()

    return this.axios.post('/clans/changeGuildMaster.php', {
      newGuildMasterUid,
      currentGuildMasterUid: this.userData.guild?.guildMasterUid
    })
  }

  sendGuildMessage(message: string): Promise<void> {
    this.checkInClan()

    return this.axios.post('/clans/sendGuildMessage.php', {
      timestamp: getCurrentTimestamp(),
      day: 'today',
      guildName: this.guildName,
      message,
    })
  }

  getGuildMessages(): Promise<ClanMessages> {
    this.checkInClan()

    return this.axios.post('/clans/getGuildMessages.php', {
      timestamp: getCurrentTimestamp(),
      day: 'today',
      guildName: this.guildName,
    })
  }

  get userName() {
    return this.userData.user.nickname
  }

  get guildName() {
    return this.userData.user.guildName
  }

  get isClanLeader() {
    return this.userData.guild?.guildMasterUid === this.userData.user.uid
  }

  private get memberUids() {
    return Object
      .entries(this.userData.guild?.memberUids ?? {})
      .filter(([, status]) => status === 'member')
      .map(([uid]) => uid)
  }

  private get requestUids() {
    return Object
      .entries(this.userData.guild?.memberUids ?? {})
      .filter(([, status]) => status === 'request')
      .map(([uid]) => uid)
  }

  get guildMembers() {
    return Object.values(this.userData.guildMembers ?? {})
      .filter(({ uid }) => this.memberUids.includes(uid))
  }

  get guildRequests() {
    return Object.values(this.userData.guildMembers ?? {})
      .filter(({ uid }) => this.requestUids.includes(uid))
      .sort((a, b) => {
        const [[cla, hza], [clb, hzb]] = [
          [a.classLevel, a.highestZone],
          [b.classLevel, b.highestZone]
        ].map((arr) => arr.map(Number));
        if (cla !== clb) {
          return clb - cla
        }
        return hzb - hza
      })
  }

  private get raidStatus() {
    const { isBonusAvailable, isSuccessful, isBonusSuccessful } = this.raidInfo.raid
    return { isBonusAvailable, isSuccessful, isBonusSuccessful }
  }

  get raidDamage() {
    return {
      raid: this.raidInfo.raid.scores,
      bonus: this.raidInfo.raid.bonusScores
    }
  }

  get isRaidDone() {
    return !!this.guildName && this.raidStatus.isBonusSuccessful
  }

  private checkInClan() {
    if (!this.guildName) {
      throw new Error('User not in clan right now')
    }
  }

  private checkIsClanLeader() {
    if (!this.isClanLeader) {
      throw new Error('User must be a clan leader')
    }
  }
}
