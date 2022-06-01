import { config } from './config';
import { Client } from 'discord.js';
import { commands } from './commands';
const client = new Client({ intents: config.intents });

client.on('ready', () => {
	console.log(`Logged in as ${client.user?.tag}!`);
});

client.login(config.token);

// commands
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	
	const command = commands.get(interaction.commandName);

	if (!command) {
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});



