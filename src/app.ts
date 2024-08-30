import cron from 'node-cron';
import './environments.ts';
import './discord.ts';
import { getGuildInfo, getRaidData } from './clickerHeroesApi.ts';
import { ClanMember } from './db/index.ts';
import { Op } from 'sequelize';
import { discordClanNotification } from './templates/discordClanNotification.ts';
import { postIntoNotificationChannel } from './discord.ts';

cron.schedule('0 */4 * * *', async () => {
  try {
  const { guildMembers, guild: { memberUids } } = await getGuildInfo();

  const currentMembers = Object.entries(memberUids)
    .filter(([, type]) => type === 'member')
    .map(([uid]) => uid)

  const members = Object.values(guildMembers).filter(({ uid }) => currentMembers.includes(uid));

  const uids = members.map(({ uid }) => uid);

  await ClanMember.destroy({
    where: {
      uid: {
        [Op.notIn]: uids,
      },
    },
  });

  const createMembers: ReadonlyArray<Record<'uid' | 'nickname', string>> =
    members.map(({ uid, nickname }) => ({ uid, nickname }));

  await ClanMember.bulkCreate(createMembers, {
    fields: ['uid', 'nickname'],
    updateOnDuplicate: ['nickname'],
  });
  } catch (e) {
    console.log(e);

  }
});

cron.schedule('50 23 * * *', async () => {
  const membersPromise = ClanMember.findAll()
  const raidPromise = getRaidData()
  const [ members, raid ] = await Promise.all([membersPromise, raidPromise])
  const active = Array<string>()
  const nonActive = Array<string>()
  members.forEach(({ uid, nickname }) => {
    if (uid in raid.scores) {
      active.push(nickname)
    } else {
      nonActive.push(nickname)
    }
  })
  const message = discordClanNotification({ active, nonActive })
  postIntoNotificationChannel(message)
}, {
  timezone: 'Etc/GMT'
})
