import { Locale, SlashCommandBuilder } from "discord.js";
import { DiscordCommand } from "../types";

const helpMessages: Partial<Record<Locale, string>> = {
  [Locale.EnglishUS]: `To register in bot just print \`/register <uid> <passwordHash>\`
You may get your uid and passwordHash in your save file by decrypting it in any save editor, like [this one](https://clickerheroes.hd-gaming.eu/)`,
}

export const help: DiscordCommand = {
  command: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Print help message'),
  async handler(interaction) {
    const content = helpMessages[interaction.locale] ?? helpMessages[Locale.EnglishUS] ?? ''
    await interaction.reply({ content, ephemeral: true })
  }
}
