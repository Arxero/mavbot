import { Client } from 'discord.js';
import { IntentOptions } from './config/IntentOptions';

(async (): Promise<void> => {
	const client = new Client({ intents: IntentOptions });

	await client.login(process.env.BOT_TOKEN);

	client.on('ready', () => {
		console.log(`Logged in as ${client.user?.tag}!`);
	});
})();
