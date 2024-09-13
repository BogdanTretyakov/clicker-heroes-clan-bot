import type { ClickerHeroesUser } from "../clickerHeroes/ClickerHeroesUser"
import type { ClickerHeroesAccountSettingsEntity, ClickerHeroesUserDiscordSettingsEntity } from "../models"

export type CronTask = {
  expression: string
  runOnInit?: boolean
  handler(ctx: TaskContext): Promise<void>
} | {
  expression: string
  runOnInit?: boolean
  rawHandler(date: TaskContext['date']): void|Promise<void>
}

export interface TaskContext {
  user: ClickerHeroesUser
  clanSettings: ClickerHeroesUserDiscordSettingsEntity|null
  settings: ClickerHeroesAccountSettingsEntity
  date: Date|'manual'|'init'
  discordId: string
}
