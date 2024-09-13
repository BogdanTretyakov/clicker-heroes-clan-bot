import { CreationOptional, DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import { sequelize } from "../db";
import type { ClickerHeroesAccountEntity } from "./ClickerHeroesAccountEntity";

export class ClickerHeroesDiscordLinkEntity extends Model<
  InferAttributes<ClickerHeroesDiscordLinkEntity>,
  InferCreationAttributes<ClickerHeroesDiscordLinkEntity>
> {
  declare id: CreationOptional<number>
  declare uid: string
  declare discordId: string
  declare guildName: string

  declare accountId: ForeignKey<ClickerHeroesAccountEntity['id']>
}

ClickerHeroesDiscordLinkEntity.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  uid: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  discordId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  guildName: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  sequelize
})
