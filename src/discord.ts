import { Client, Events, GatewayIntentBits, TextChannel } from 'discord.js'
import { env } from './environments';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages
  ]
})

client.once(Events.ClientReady, readyClient => {
	console.log(`Discord ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
await client.login(env.DISCORD_BOT_TOKEN);

const channel = await client.channels.fetch(env.DISCORD_CHANNEL_ID)

if (!channel) {
  throw new Error('No channel found')
}

const typedChannel = await channel.fetch()

export const postIntoNotificationChannel = async (data: string) => {
  if (!(typedChannel instanceof TextChannel)) return
  await typedChannel.send(data)
}
