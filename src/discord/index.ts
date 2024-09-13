import { Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js'
import { env } from '../environments';
import * as commands from './commands';

const commandsArray = Object.values(commands)

const rest = new REST().setToken(env.DISCORD_BOT_TOKEN);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
  ]
})

client.once(Events.ClientReady, readyClient => {
	console.log(`Discord ready! Logged in as ${readyClient.user.tag}`);

  readyClient.guilds.cache.forEach(({ id }) => registerGuildDiscordCommands(id))
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isAutocomplete()) return

  if (!env.DISCORD_ADMINS_ID.includes(interaction.user.id)) {
    await interaction.reply({
      content: 'You are not allowed to use this bot, sry',
      ephemeral: true,
    })
    return
  }

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
      await interaction.followUp({
        content: 'There was an error while executing this command!',
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true
      });
    }
  }
})

client.on(Events.GuildCreate, async guild => {
  const me = await guild.members.fetchMe()
  if (me.permissions.has('Administrator')) {
    registerGuildDiscordCommands(guild.id)
  } else {
    guild.systemChannel?.send('Bot need Administrator rules to work')
  }
})

client.on(Events.GuildMemberUpdate, (oldMember, newMember) => {
  if (oldMember.id !== client.user?.id) return
  if (oldMember.permissions.has('Administrator') || !newMember.permissions.has('Administrator')) return
  registerGuildDiscordCommands(newMember.guild.id)
})

try {
  const body = commandsArray
    .filter(({ guildOnly }) => !guildOnly)
    .map(cmd => cmd.command.toJSON())


  if (!!body.length) {
    await rest.put(
      Routes.applicationCommands(env.DISCORD_APPLICATION_ID),
      { body },
    );
  }
} catch (e) {
  console.error(e)
}


export async function registerGuildDiscordCommands (guildId: string) {
  try {
    const body = commandsArray
      .filter(({ guildOnly }) => !!guildOnly)
      .map(cmd => cmd.command.toJSON())

    await rest.put(
			Routes.applicationGuildCommands(env.DISCORD_APPLICATION_ID, guildId),
			{ body },
		);
  } catch (e) {
    console.error(e)
  }
}

await client.login(env.DISCORD_BOT_TOKEN);

export { client as discordClient }
