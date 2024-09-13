import { Op } from "sequelize";
import { ClickerHeroesAccountEntity } from "../models";
import { CronTask } from "./types";
import { ClickerHeroesUser } from "../clickerHeroes/ClickerHeroesUser";

export const updateClanInfo: CronTask = {
  expression: '0 */1 * * *',
  async rawHandler() {
    const accounts = await ClickerHeroesAccountEntity.findAll({
      where: {
        [Op.or]: [{ guildName: null }, { userName: null }]
      }
    })

    for (const account of accounts) {
      try {
        const user = await ClickerHeroesUser.create(account)

        if (account.userName !== user.userName || account.guildName !== user.guildName) {
          account.userName = user.userName
          account.guildName = user.guildName
          await account.save()
        }
      } catch(e) {
        account.destroy({ force: true })
      }
    }
  }
}
