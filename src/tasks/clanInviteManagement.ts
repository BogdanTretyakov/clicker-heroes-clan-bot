import { CronTask } from "./types";

export const clanInviteManagement: CronTask = {
  expression: '*/30 * * * *',
  async handler({ user, clanSettings }) {
    const { isClanLeader, guildName } = user
    if (!isClanLeader || !guildName || !clanSettings) return

    let membersCount = user.guildMembers.length

    for (const request of user.guildRequests) {
      if (membersCount >= 10) break

      const [level, hze] = [request.classLevel, request.highestZone].map(Number)
      if (level < clanSettings.inviteClassLvlRequirement || hze < clanSettings.inviteHZERequirement) continue

      await user.acceptGuildRequest(request.uid)
      ++membersCount
    }

    await user.updateGuildInfo()

    await Promise.all(user.guildRequests.map(({ uid }) => user.rejectGuildRequest(uid)))
  }
}
