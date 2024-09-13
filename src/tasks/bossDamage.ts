import { timeoutPromise } from "../utils/promises";
import { CronTask } from "./types";

export const bossDamage: CronTask = {
  expression: '1 * * * *',
  runOnInit: true,
  async handler({ user, settings }) {
    const legacy = (async () => {
      if (!settings.fightLegacyBoss) return

      await user.doLegacyBossDamage(settings.legacyBossKillCount)
    })()

    const raid = (async () => {
      if (user.isRaidDone || !settings.fightBoss) return
      await user.doBossDamage()
      if (user.isRaidDone || !settings.buyBonusFight) return
      await timeoutPromise(15000)
      await user.buyBonusFight()
      await timeoutPromise(1000)
      await user.doBossDamage()
      await timeoutPromise(15000)
    })()

    await Promise.all([legacy, raid])

  },
}