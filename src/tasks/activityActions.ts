import dayjs from "dayjs";
import { CronTask } from "./types";
import {
  ClickerHeroesDiscordLinkEntity,
  ClickerHeroesMemberActivityEntity,
  ClickerHeroesUserDiscordSettingsEntity,
} from "../models";
import { Op, col, fn, literal } from "sequelize";
import { asyncForEach } from "../utils/arrays";
import { GuildMember } from "../clickerHeroes/types";
import { discordClanNotification, TemplateUser } from "../templates/discordClanNotification";
import { TextChannel } from "discord.js";


export const activityActions: CronTask = {
  expression: '0 1 * * *',
  async handler({ user, clanSettings }) {
    const { guildName, isClanLeader } = user
    if (!guildName || !isClanLeader) return

    if (!clanSettings || (!clanSettings.autoKickInactive && !clanSettings.activityStatsChannel)) return

    const today = dayjs.utc().startOf('day')
    const yesterday = today.subtract(1, 'day')

    const guildUids = user.guildMembers.map(({ uid }) => uid)

    const yesterdayInactive = await ClickerHeroesMemberActivityEntity.findAll({
      where: {
        date: yesterday.toDate(),
        status: false,
        uid: {
          [Op.in]: guildUids
        }
      }
    })

    const kickList = await getKickList(guildUids, clanSettings)

    const inactiveUids = yesterdayInactive
      .map(({ uid }) => uid)
      .filter(item => !kickList.includes(item))

    const activeUids = guildUids.filter(item => !kickList.includes(item) && !inactiveUids.includes(item));

    if (clanSettings.autoKickInactive) {
      await asyncForEach(kickList, user.kickGuildMember, 1000)
    }

    if (clanSettings.activityStatsChannel) {
      const links = await ClickerHeroesDiscordLinkEntity.findAll({
        where: {
          uid: { [Op.in]: guildUids }
        }
      })

      const enricher = enrichUidToTemplateUser(user.guildMembers, links)

      const content = discordClanNotification({
        active: enricher(activeUids),
        nonActive: enricher(inactiveUids),
        kickList: clanSettings.autoKickInactive ? [] : enricher(kickList),
        kicked: clanSettings.autoKickInactive ? enricher(kickList) : []
      })

      const { discordClient } = await import('../discord');

      const channel = await discordClient.channels.fetch(clanSettings.activityStatsChannel)

      if (channel instanceof TextChannel) {
        channel.send(content)
      }

      if (clanSettings.autoKickInactive && kickList.length) {
        const guild = await discordClient.guilds.fetch(clanSettings.discordGuildId)
        if (guild) {
          asyncForEach(kickList, async (uid) => {
            const discordId = links.find(link => link.uid === uid)?.discordId
            if (discordId) {
              await guild.members.kick(discordId);
            }
          }, 500)
        }
      }
    }

    if (clanSettings.autoKickInactive) {
      await ClickerHeroesDiscordLinkEntity.destroy({
        where: {
          uid: { [Op.in]: kickList }
        }
      })
    }



  },
}

async function getKickList(
  uids: string [],
  settings: ClickerHeroesUserDiscordSettingsEntity
) {
  const today = dayjs.utc().startOf('day')

  switch (settings.kickAlgorithm) {
    case 'daysInRow': {
      const timeCheck = today.subtract(settings.kickCountRow, 'day').toDate()
      const result = await ClickerHeroesMemberActivityEntity.findAll({
        group: 'uid',
        attributes: [
          'uid',
          [fn('COUNT', col('status')), 'statusCount']
        ],
        where: {
          uid: { [Op.in]: uids },
          date: { [Op.gte]: timeCheck },
          status: false,
        },
        having: {
          statusCount: { [Op.gte]: settings.kickCountRow }
        }
      });

      return result.map(({ uid }) => uid)
    }

    case 'daysOfDays': {
      const timeCheck = today.subtract(settings.kickCountOfDays, 'day').toDate()

      const result = await ClickerHeroesMemberActivityEntity.findAll({
        group: 'uid',
        where: {
          uid: { [Op.in]: uids },
          date: { [Op.gte]: timeCheck },
        },
        attributes: [
          'uid',
          [fn('COUNT', literal('*')), 'totalCount'],
          [fn('SUM', literal("CASE WHEN status = false THEN 1 ELSE 0 END")), 'inactiveCount']
        ],
        having: {
          [Op.or] : {
            inactiveCount: { [Op.gte]: settings.kickCountDays },
            [Op.and]: {
              totalCount: settings.kickCountOfDays,
              inactiveCount: { [Op.gte]: settings.kickCountDays }
            }
          }
        }
      })

      return result.map(({ uid }) => uid)
    }

    default:
      return Array<string>()
  }
}

function enrichUidToTemplateUser(
  guildMembers: GuildMember[],
  discordLinks: ClickerHeroesDiscordLinkEntity[]
) {
  return (uids: string[]): TemplateUser[] => uids.map(uid => ({
    nickname: guildMembers.find(member => member.uid === uid)?.nickname ?? '',
    discordId: discordLinks.find(link => link.uid === uid)?.discordId
  }))
}
