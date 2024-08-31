# Clicker Heroes Clan Bot

## What is this?
This is clan management helping bot for clicker heroes

## What it may do?
- watching clan members activity and post statistic in Discord channel (at 23:50 GMT)
- auto battle immortal raid (at 00:05 GMT)

## What in plan to do?
- auto battle legacy raid
- auto level immortal class
- refactor config (it messy for now, lol)
- refactor to module system (making some functions optional)
- add telegram support
- auto clan management (accept requests, kicking members, etc)
- UX improvements

## How to start it?

1. Clone this repo
2. Install [Node.js](https://nodejs.org/en/download/)
3. Install dependencies and build project
```
npm i
npm run build
```
4. Set configuration in `.env` file
```
cp .env.example .env
nano .env
```
5. Run bot
```
# Simple way
node ./dist/app.mjs

# Way better - daemonize
# I prefer forever.js, but you may use pm2
# or any other methods
npm i -g forever
forever start ./dist/app.mjs
```

## Where to get `.env` values?

#### `CLICKER_HEROES_UID` and `CLICKER_HEROES_UID`
Put your save file in any save editor (no adv here). Values you need is under keys `uniqueId` and `passwordHash`

#### `DISCORD_BOT_TOKEN` and `DISCORD_APPLICATION_ID`
Create (or use existing) bot at [Discord Dev Portal](https://discord.com/developers/applications)

General Information -> Application ID
Bot -> Reset Token

#### `DISCORD_GUILD_ID` and `DISCORD_CHANNEL_ID`
Use [official Discord guide](https://support-dev.discord.com/hc/en-us/articles/360028717192-Where-can-I-find-my-Application-Team-Server-ID).

Guild ID is Server ID.
Channel ID is ID of channel at this server, where notifications will send.