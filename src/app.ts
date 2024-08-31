import cron from 'node-cron';
import './environments.ts';
import { clickerHeroesCallbacks } from './clickerHeroes/callbacks.ts';

cron.schedule(
  '*/30 * * * *',
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
