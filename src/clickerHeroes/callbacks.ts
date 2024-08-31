import { Op } from "sequelize";
import { ClanMember } from "../db";
import { clickerHeroesApi } from "./api";
import { discordClanNotification } from "../templates/discordClanNotification";
import { postIntoNotificationChannel } from "../discord";
import { timeoutPromise } from "../utils/promises";

function calculateImmortalHealth(level: number, userLevel: number): string {
  const health = 500 * (2 ** level);
  const damage = 150 * ((3 * userLevel * userLevel) + userLevel)
  const clicks = Math.ceil(health / damage) + 1
  const rawExpo = (clicks * damage).toExponential(15)
  return rawExpo.replace(/\+/g, '')
}

const updateGuildInfo = async () => {
  const { guildMembers, guild: { memberUids } } = await clickerHeroesApi.getGuildInfo();

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
}

const postGuildStatistic = async () => {
  const membersPromise = ClanMember.findAll()
  const raidPromise = clickerHeroesApi.getRaidData()
  const [ members, { raid } ] = await Promise.all([membersPromise, raidPromise])

  const active = Array<string>()
  const nonActive = Array<string>()
  members.forEach(({ uid, nickname }) => {
    if (uid in raid.scores || uid in raid.bonusScores) {
      active.push(nickname)
    } else {
      nonActive.push(nickname)
    }
  })
  const message = discordClanNotification({ active, nonActive })
  await postIntoNotificationChannel(message)
}

const autoFightBosses = async () => {
  const guildInfoPromise = clickerHeroesApi.getGuildInfo()
  const raidInfoPromise = clickerHeroesApi.getRaidData()
  const [{ user }, { raid }] = await Promise.all([guildInfoPromise, raidInfoPromise])
  const numberLevel = Number(raid.level)
  const userLevel = Number(user.classLevel)
  if (isNaN(numberLevel) || isNaN(userLevel)) {
    throw new Error('Error while parsing raid level')
  }
  const damage = calculateImmortalHealth(numberLevel, userLevel)
  await clickerHeroesApi.doBossDamage(damage, raid.level)
  await timeoutPromise(20000)
  await clickerHeroesApi.buyBonusFight()
  await timeoutPromise(5000)
  await clickerHeroesApi.doBossDamage(damage, raid.level, true)
}

export const clickerHeroesCallbacks = {
  updateGuildInfo,
  postGuildStatistic,
  autoFightBosses,
}
