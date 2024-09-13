import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../db";

export class ClickerHeroesUserDiscordSettingsEntity extends Model<
  InferAttributes<ClickerHeroesUserDiscordSettingsEntity>,
  InferCreationAttributes<ClickerHeroesUserDiscordSettingsEntity>
> {
  declare id: CreationOptional<number>
  declare guildName: string
  declare discordGuildId: string
  declare activityStatsChannel: CreationOptional<string|null>

  declare autoKickInactive: CreationOptional<boolean>
  declare kickAlgorithm: CreationOptional<'daysInRow'|'daysOfDays'>
  declare kickCountRow: CreationOptional<number>
  declare kickCountDays: CreationOptional<number>
  declare kickCountOfDays: CreationOptional<number>

  declare autoInviteManagement: CreationOptional<boolean>
  declare inviteClassLvlRequirement: CreationOptional<number>
  declare inviteHZERequirement: CreationOptional<number>
}

ClickerHeroesUserDiscordSettingsEntity.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  guildName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: 'guild',
  },
  discordGuildId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  autoKickInactive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  activityStatsChannel: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  kickAlgorithm: {
    type: DataTypes.STRING,
    defaultValue: 'daysInRow'
  },
  kickCountRow: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
  },
  kickCountDays: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  kickCountOfDays: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  autoInviteManagement: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  inviteClassLvlRequirement: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  inviteHZERequirement: {
    type: DataTypes.INTEGER,
    defaultValue: 200,
  }
}, {
  sequelize
})
