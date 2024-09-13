import { CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { sequelize } from "../db";
import type { ClickerHeroesAccountEntity } from "./ClickerHeroesAccountEntity";

export class ClickerHeroesAccountSettingsEntity extends Model<
  InferAttributes<ClickerHeroesAccountSettingsEntity>,
  InferCreationAttributes<ClickerHeroesAccountSettingsEntity>
> {
  declare id: CreationOptional<number>

  declare fightBoss: CreationOptional<boolean>
  declare buyBonusFight: CreationOptional<boolean>

  declare fightLegacyBoss: CreationOptional<boolean>
  declare legacyBossKillCount: CreationOptional<number>

  declare accountId: ForeignKey<ClickerHeroesAccountEntity['id']>
}

ClickerHeroesAccountSettingsEntity.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  fightBoss: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  buyBonusFight: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  fightLegacyBoss: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  legacyBossKillCount: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
  }
}, {
  sequelize
})
