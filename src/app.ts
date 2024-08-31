import cron from 'node-cron';
import './environments.ts';
import './discord.ts';
import { clickerHeroesCallbacks } from './clickerHeroes/callbacks.ts';

cron.schedule(
  '0 */4 * * *',
  clickerHeroesCallbacks.updateGuildInfo
);

cron.schedule(
  '50 23 * * *',
  clickerHeroesCallbacks.postGuildStatistic,
  { timezone: 'Etc/GMT' }
);

cron.schedule(
  '5 0 * * *',
  clickerHeroesCallbacks.autoFightBosses,
  { timezone: 'Etc/GMT' }
)
