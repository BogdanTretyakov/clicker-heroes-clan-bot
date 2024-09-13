import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize"
import { sequelize } from "../db"
import type { ClickerHeroesDiscordLinkEntity } from "./ClickerHeroesDiscordLinkEntity"
import type { ClickerHeroesAccountSettingsEntity } from "./ClickerHeroesAccountSettingsEntity"

export class ClickerHeroesAccountEntity extends Model<
  InferAttributes<ClickerHeroesAccountEntity>,
  InferCreationAttributes<ClickerHeroesAccountEntity>
> {
  declare id: CreationOptional<number>
  declare uid: string
  declare passwordHash: string
  declare discordId: string
  declare guildName: CreationOptional<string|null>
  declare userName: CreationOptional<string|null>

  declare accountLinks: NonAttribute<ClickerHeroesDiscordLinkEntity[]>
  declare accountSettings: NonAttribute<ClickerHeroesAccountSettingsEntity>
}

ClickerHeroesAccountEntity.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    uid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    discordId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    guildName: {
      type: DataTypes.STRING,
      defaultValue: null
    },
    userName: {
      type: DataTypes.STRING,
      defaultValue: null
    }
  },
  {
    sequelize,
    hooks: {
      async beforeDestroy(instance, { force }) {
        if (!force) return
        const { discordClient } = await import("../discord")
        const discordUser = await discordClient.users.fetch(instance.discordId);
        await discordUser.send(
          `There is a problem with your account ${instance.uid}, so we are deleted this. Register it again to continue using bot`
        );
      }
    }
  }
)
