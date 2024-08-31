import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "discord.js";

export interface DiscordCommand {
  command: SlashCommandBuilder|SlashCommandOptionsOnlyBuilder,
  handler: (interaction: ChatInputCommandInteraction) => Promise<void>|void
}
