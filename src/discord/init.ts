import { Client, Events, REST, Routes } from "discord.js";
import * as commands from './commands';
import { env } from "../environments";

const commandsArray = Object.values(commands)

const rest = new REST().setToken(env.DISCORD_BOT_TOKEN);

export const initDiscordCommands = async (client: Client) => {
  client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = commandsArray.find(cmd => cmd.command.name === interaction.commandName)
    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
		  return;
    }

    try {
      await command.handler(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
      } else {
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    }
  })

  try {
    const body = commandsArray.map(cmd => cmd.command.toJSON())
    const data: any = await rest.put(
			Routes.applicationGuildCommands(env.DISCORD_APPLICATION_ID, env.DISCORD_GUILD_ID),
			{ body },
		);
    console.log(`Successfully reloaded ${data?.length} application (/) commands.`);
  } catch (e) {
    console.error(e)
  }

}
