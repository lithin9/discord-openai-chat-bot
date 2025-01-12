require('dotenv').config();
const { SapphireClient } = require('@sapphire/framework');

const token = process.env.DISCORD_BOT_TOKEN;
const client = new SapphireClient({ intents: ['GUILDS', 'GUILD_MESSAGES'] });

client.login(token)

process.on('uncaughtException', (err) => {
	console.error('Uncaught Exception:', err);
});
process.on('SIGTERM', () => {
	console.log('Process terminating...');
	process.exit(0);
});
process.on('SIGINT', () => {
	console.log('Process interrupted...');
	process.exit(0);
});