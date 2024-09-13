export class ClickerHeroesConfig {
  clickerHeroesUserId: string|null = null
  clickerHeroesPasswordHash: string|null = null
  autoFightImmortal = true
  autoBuyBonusImmortal = true
  discordGuildId: number|null = null

  toJSON() {
    return JSON.stringify(this)
  }

  static fromJSON(json: string) {
    const data = JSON.parse(json)
    const instance = new this()

    for (const key in data) {
      if (key in instance) {
        // @ts-expect-error
        instance[key] = data[key]
      }
    }

    return instance
  }
}
