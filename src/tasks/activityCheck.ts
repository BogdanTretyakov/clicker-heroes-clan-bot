import dayjs from "dayjs";
import { CronTask } from "./types";
import { ClickerHeroesMemberActivityEntity } from "../models";
import { sequelize } from "../db";

export const activityCheck: CronTask = {
  expression: '40 23 * * *',
  async handler({ user }) {
    const guildName = user.guildName
    if (!guildName) return

    const date = dayjs.utc().startOf('day').toDate()

    const transaction = await sequelize.transaction()

    user.guildMembers.forEach(async ({ uid }) => {
      const status = uid in user.raidDamage.raid || uid in user.raidDamage.bonus
      await ClickerHeroesMemberActivityEntity.upsert({
        date,
        uid,
        status
      }, { transaction })
    })

    await transaction.commit()
  }
}