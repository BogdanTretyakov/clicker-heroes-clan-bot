type Timestamp = string
type UID = string

export interface GuildMember {
  chosenClass: string;
  classLevel: string;
  highestZone: string;
  lastBonusRewardTimestamp: Timestamp;
  lastRewardTimestamp: Timestamp;
  nickname: string;
  uid: UID;
}

export interface GuildInfo {
  guild: null | {
    autoJoin: boolean;
    currentNewRaidLevel: number;
    currentRaidLevel: string;
    guildMasterUid: string;
    memberUids: Record<UID, 'member' | 'request'>;
    name: string;
    newRaidLocked: 'true' | 'false';
  };
  guildMembers?: Record<number, GuildMember>;
  user: {
    chosenClass: string;
    classLevel: string;
    guildName: string|null;
    highestZone: string;
    isGuildRequest: boolean;
    lastBonusRewardTimestamp: Timestamp;
    lastRewardTimestamp: Timestamp;
    nickname: string;
    passwordHash: string;
    uid: UID;
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
    scores: Record<UID, string>;
    weakness: number;
  };
}

export interface LegacyRaidInfo {
  raid: {
    date: string;
    guildName: string;
    isSuccessful?: boolean;
    level: string;
    scores: Record<string, string>
  };
}


export interface ClanMessages {
  guildName: string;
  messages: Record<`${Timestamp}.${string}`, `${UID};${string}`>
}
