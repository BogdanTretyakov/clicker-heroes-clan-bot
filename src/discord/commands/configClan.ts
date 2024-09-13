import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, ComponentType, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { DiscordCommand } from "../types";
import { ClickerHeroesUserDiscordSettingsEntity } from "../../models";
import { isNotNil } from "../../utils/guards";

export const configClan: DiscordCommand = {
  guildOnly: true,
  command: new SlashCommandBuilder()
    .setName('configclan')
    .setDescription('Configure clans at this server'),
  async handler(interaction) {
    if (!interaction.guildId) {
      await interaction.reply({
        content: 'This command only available at Discord servers',
        ephemeral: true,
      })
      return
    }
    const clans = await ClickerHeroesUserDiscordSettingsEntity.findAll({
      where: {
        discordGuildId: interaction.guildId
      }
    })

    if (!clans.length) {
      await interaction.reply({
        content: 'There are no clans registered at this server',
        ephemeral: true,
      })
      return
    }

    const select = new StringSelectMenuBuilder()
    .setCustomId('clansettingsselector')
    .setPlaceholder('Select a clan to add on this server')
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(
      clans.map(
        ({ guildName }) => new StringSelectMenuOptionBuilder()
          .setLabel(guildName)
          .setDescription(`Select clan "${guildName}"`)
          .setValue(guildName)
      )
    )

    const selectClanRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)

    const response = await interaction.reply({
      content: 'Select clan to configure:',
      components: [selectClanRow],
      ephemeral: true,
    })

    const collector = response.createMessageComponentCollector({

    })

    try {
      const selected = await response.awaitMessageComponent<ComponentType.StringSelect>({ time: 60000 })
      const [selectedGuildName] = selected.values

      const clanSettings = clans.find(({ guildName }) => selectedGuildName === guildName)

      if (!clanSettings) {
        await interaction.editReply({
          content: 'There is some error while loading your clan settings',
          components: [],
        })
        return
      }

      const components = genetrateSettingsRows(clanSettings)

      await interaction.editReply({
        components,
        content: `Settings of ${selectedGuildName}:`
      })

    } catch (e) {
      console.log(e)
      await interaction.editReply({
        content: 'Confirmation not received within 1 minute, cancelling',
        components: [],
      });
    }
  }
}

function genetrateSettingsRows(settings: ClickerHeroesUserDiscordSettingsEntity) {
  const selectActivityChannel = new ChannelSelectMenuBuilder()
    .setCustomId('selectactivitychannel')
    .setPlaceholder('Select channel where to post activity reports')
    .setChannelTypes(ChannelType.GuildText)
    .setMinValues(1)
    .setMaxValues(1)
    .setDefaultChannels(
      [settings.activityStatsChannel].filter(isNotNil)
    )

  const managementRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('autoinvitetoogle')
      .setLabel(`Auto invite: ${settings.autoInviteManagement}`)
      .setStyle(ButtonStyle.Secondary)
  )

  return [
    new ActionRowBuilder<ChannelSelectMenuBuilder>()
      .addComponents(selectActivityChannel),
    managementRow
  ]
}
