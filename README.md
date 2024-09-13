# Clicker Heroes Clan Bot

## What is this?
This is clan management helping bot for clicker heroes

## What it may do?
- watching clan members activity and post statistic in Discord channel (at 23:50 GMT)
- auto battle immortal raid (at 00:05 GMT)
- auto battle legacy raid
- auto clan management (accept requests, kicking members, etc)
- manage settings for all of this functions

## What in plan to do?
- ~~auto level immortal class~~ - not available with api
- add telegram support
- better connecting DB + default docker configs

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

#### `DISCORD_BOT_TOKEN` and `DISCORD_APPLICATION_ID`
Create (or use existing) bot at [Discord Dev Portal](https://discord.com/developers/applications)

General Information -> Application ID
Bot -> Reset Token

#### `DISCORD_ADMINS_ID`
Use [official Discord guide](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID#h_01HRSTXPS5H5D7JBY2QKKPVKNA).

There is list of user ID, separated by space, that can use bot. For other users bot will just do nothing