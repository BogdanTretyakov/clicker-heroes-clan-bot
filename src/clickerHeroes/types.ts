export interface CHApiResponse<R extends Record<string, unknown>> {
  result: R;
  success: true;
}

export interface GuildMember {
  chosenClass: string;
  classLevel: string;
  highestZone: string;
  lastBonusRewardTimestamp: string;
  lastRewardTimestamp: string;
  nickname: string;
  uid: string;
}

export interface GuildInfo {
  guild: {
    autoJoin: boolean;
    currentNewRaidLevel: number;
    currentRaidLevel: string;
    guildMasterUid: string;
    memberUids: Record<string | number, 'member' | 'request'>;
    name: string;
    newRaidLocked: 'true' | 'false';
  };
  guildMembers: Record<number, GuildMember>;
  user: {
    chosenClass: string;
    classLevel: string;
    guildName: string;
    highestZone: string;
    isGuildRequest: boolean;
    lastBonusRewardTimestamp: string;
    lastRewardTimestamp: string;
    nickname: string;
    passwordHash: string;
    uid: string;
  };
}

export interface RaidInfo {
  raid: {
    bonusScores: Record<string, string>;
    date: string;
    guildName: string;
    isBonusAvailable: boolean;
    isBonusSuccessful: boolean;
    isSuccessful: boolean;
    level: string;
    scores: Record<string, string>;
    weakness: number;
  };
}
