import { Op } from 'sequelize';
import { ClanActivity, ClanMember, sequelizeInstance } from '../db';
import { clickerHeroesApi } from './api';
import { discordClanNotification } from '../templates/discordClanNotification';
import { postIntoNotificationChannel } from '../discord';
import { timeoutPromise } from '../utils/promises';
import { MAX_CLICKER_HEROES_INACTIVE } from '../constants/clickerHeroes';

function calculateImmortalHealth(level: number, userLevel: number): string {
  const health = 500 * 2 ** level;
  const damage = 150 * (3 * userLevel * userLevel + userLevel);
  const clicks = Math.ceil(health / damage) + 1;
  const rawExpo = (clicks * damage).toExponential(15);
  return rawExpo.replace(/\+/g, '');
}

const updateGuildInfo = async () => {
  const {
    guildMembers,
    guild: { memberUids },
  } = await clickerHeroesApi.getGuildInfo();

  const currentMembers = Object.entries(memberUids)
    .filter(([, type]) => type === 'member')
    .map(([uid]) => uid);

  const members = Object.values(guildMembers).filter(({ uid }) =>
    currentMembers.includes(uid)
  );

  const uids = members.map(({ uid }) => uid);

  await ClanMember.destroy({
    where: {
      uid: {
        [Op.notIn]: uids,
      },
    },
  });
  ClanActivity.destroy({
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
};

const postGuildStatistic = async () => {
  const membersPromise = ClanMember.findAll();
  const raidPromise = clickerHeroesApi.getRaidData();
  const [members, { raid }] = await Promise.all([membersPromise, raidPromise]);

  const activeUids = Array<string>();
  const active = Array<{ nickname: string }>();
  const nonActiveUids = Array<string>();
  members.forEach(({ uid, nickname }) => {
    if (uid in raid.scores || uid in raid.bonusScores) {
      active.push({ nickname });
      activeUids.push(uid);
    } else {
      nonActiveUids.push(uid);
    }
  });

  if (activeUids.length) {
    await ClanActivity.destroy({
      where: {
        uid: {
          [Op.notIn]: activeUids,
        },
      },
    });
  }

  const nonActiveMembersRecords = !nonActiveUids.length ? [] : (await ClanMember.findAll({
    where: {
      uid: {
        [Op.in]: nonActiveUids,
      },
    },
  }));
  const activityRecords = await ClanActivity.findAll();

  const transaction = await sequelizeInstance.transaction();

  const { kickList, nonActive } = nonActiveMembersRecords.reduce(
    (acc, { uid, discordId, nickname }) => {
      let activity = activityRecords.find(item => uid === item.uid)
      if (!activity) {
        activity = ClanActivity.build({ uid, inactiveCount: 0 })
      }
      activity.inactiveCount = activity.inactiveCount + 1
      activity.save({ transaction })
      ;(
        activity.inactiveCount >= MAX_CLICKER_HEROES_INACTIVE
        ? acc.kickList
        : acc.nonActive
      ).push({ nickname, discordId })

      return acc;
    },
    { active: [], nonActive: [], kickList: [] } as Parameters<
      typeof discordClanNotification
    >[0]
  );

  const message = discordClanNotification({ active, nonActive, kickList });
  await postIntoNotificationChannel(message);
  await transaction.commit();
};

const autoFightBosses = async () => {
  const guildInfoPromise = clickerHeroesApi.getGuildInfo();
  const raidInfoPromise = clickerHeroesApi.getRaidData();
  const [{ user }, { raid }] = await Promise.all([
    guildInfoPromise,
    raidInfoPromise,
  ]);
  const numberLevel = Number(raid.level);
  const userLevel = Number(user.classLevel);
  if (isNaN(numberLevel) || isNaN(userLevel)) {
    throw new Error('Error while parsing raid level');
  }
  const damage = calculateImmortalHealth(numberLevel, userLevel);
  await clickerHeroesApi.doBossDamage(damage, raid.level);
  await timeoutPromise(20000);
  await clickerHeroesApi.buyBonusFight();
  await timeoutPromise(5000);
  await clickerHeroesApi.doBossDamage(damage, raid.level, true);
};

export const clickerHeroesCallbacks = {
  updateGuildInfo,
  postGuildStatistic,
  autoFightBosses,
};
