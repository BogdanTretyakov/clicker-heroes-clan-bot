import {
  ClickerHeroesAccountEntity,
  ClickerHeroesDiscordLinkEntity,
  ClickerHeroesAccountSettingsEntity,
} from "../models";

ClickerHeroesAccountEntity.hasMany(ClickerHeroesDiscordLinkEntity, {
  onDelete: 'CASCADE',
  as: 'accountLinks',
  sourceKey: 'id',
  foreignKey: 'accountId'
})

ClickerHeroesAccountEntity.hasOne(ClickerHeroesAccountSettingsEntity, {
  onDelete: 'CASCADE',
  as: 'accountSettings',
  sourceKey: 'id',
  foreignKey: 'accountId',
})

ClickerHeroesAccountEntity.afterCreate(async ({ id }) => {
  await ClickerHeroesAccountSettingsEntity.findOrCreate({ where: { accountId: id } })
})

ClickerHeroesDiscordLinkEntity.belongsTo(ClickerHeroesAccountEntity, {
  onDelete: 'CASCADE',
  foreignKey: 'accountId',
  targetKey: 'id'
})

ClickerHeroesAccountSettingsEntity.belongsTo(ClickerHeroesAccountEntity, {
  onDelete: 'CASCADE',
  foreignKey: 'accountId',
  targetKey: 'id',
})
