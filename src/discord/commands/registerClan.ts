import { ActionRowBuilder, ComponentType, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { DiscordCommand } from "../types";
import { ClickerHeroesAccountEntity, ClickerHeroesUserDiscordSettingsEntity } from "../../models";
import { ClickerHeroesUser } from "../../clickerHeroes/ClickerHeroesUser";
import { isNotNil } from "../../utils/guards";
import { Op } from "sequelize";

export const registerClan: DiscordCommand = {
  guildOnly: true,
  command: new SlashCommandBuilder()
      .setName('addclan')
      .setDescription('Adding clan into this discord channel'),
  async handler(interaction) {
    const messageNoClanAvailable = () => interaction.reply({
      content: 'There is no clan to add. Try to register new user',
      ephemeral: true,
    })

    if (!interaction.guildId) {
      await messageNoClanAvailable()
      return
    }


    const accounts = await ClickerHeroesAccountEntity.findAll({
      where: {
        discordId: interaction.user.id
      }
    })

    if (!accounts.length) {
      await messageNoClanAvailable()
      return
    }

    const clans = (await Promise.all(accounts.map(account => ClickerHeroesUser.create(account))))
      .map(({ guildName }) => guildName)
      .filter(isNotNil);

    if (!clans.length) {
      await messageNoClanAvailable()
      return
    }

    const existingClans = await ClickerHeroesUserDiscordSettingsEntity.findAll({
      attributes: ['guildName'],
      where: {
        guildName: { [Op.in]: clans }
      }
    })

    const availableClans = clans.filter(clan => !existingClans.some(({ guildName }) => guildName === clan))

    if (!availableClans.length) {
      await messageNoClanAvailable()
      return
    }

    const select = new StringSelectMenuBuilder()
      .setCustomId('clanselector')
      .setPlaceholder('Select a clan to add on this server')
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(
        availableClans.map(
          clanName => new StringSelectMenuOptionBuilder()
            .setLabel(clanName)
            .setDescription(`Select clan "${clanName}"`)
            .setValue(clanName)
        )
      )

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)

    const response = await interaction.reply({
      content: 'Select a clan:',
      components: [row],
      ephemeral: true,
    })

    try {
      const selected = await response.awaitMessageComponent<ComponentType.StringSelect>({ time: 60000 })
      const [guildName] = selected.values

      await ClickerHeroesUserDiscordSettingsEntity.create({
        discordGuildId: interaction.guildId,
        guildName,
      })

      await interaction.editReply({
        components: [],
        content: `Clan "${guildName}" successfully added`,
      })

    } catch (e) {
      await interaction.editReply({
        content: 'Confirmation not received within 1 minute, cancelling',
        components: [],
      });
    }

  }
}
