import { ClickerHeroesUser } from '../clickerHeroes/ClickerHeroesUser';
import { ClickerHeroesAccountEntity, ClickerHeroesAccountSettingsEntity, ClickerHeroesUserDiscordSettingsEntity } from '../models';
import { timeoutPromise } from '../utils/promises';
import { TaskContext } from './types';

export const createEachAccountRunner =
  (cb: (ctx: TaskContext) => Promise<void>) =>
  async (date: TaskContext['date']) => {
    const accounts = await ClickerHeroesAccountEntity.findAll();
    for (const account of accounts) {
      const user = await ClickerHeroesUser.create(account)
        .catch(async () => {
          await account.destroy({ force: true });
        });

      if (!user) continue;

      const [accountSettings] = await ClickerHeroesAccountSettingsEntity.findOrCreate({
        where: {
          accountId: account.id
        }
      })

      const clanSettings = user.guildName
        ? await ClickerHeroesUserDiscordSettingsEntity.findOne({ where: { guildName: user.guildName } })
        : null

      await cb({
        user,
        date,
        clanSettings,
        settings: accountSettings,
        discordId: account.discordId
      });
      await timeoutPromise(1000);
    }
  };
