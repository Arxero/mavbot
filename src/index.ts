import { Config } from './config';
import { Client } from 'discord.js';
import { commands, commandsReg } from './commands';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

async function bootstrap(): Promise<void> {
	const config = new Config();
	await config.loadConfigs();

	const client = new Client({ intents: config.config.intents });
	client.login(config.config.token);

	client.on('ready', () => {
		console.log(`Logged in as ${client.user?.tag}!`);
	});

	const rest = new REST({ version: '9' }).setToken(config.config.token);

	try {
		await rest.put(Routes.applicationGuildCommands(config.config.clientId, config.config.guildId!), {
			body: commandsReg.map(c => c.command.toJSON()),
		});
		console.log('Successfully registered application commands.');
	} catch (error) {
		console.error(error);
	}

	client.on('interactionCreate', async interaction => {
		if (!interaction.isCommand()) {
			return;
		}

		const command = commands.get(interaction.commandName);

		if (!command) {
			return;
		}

		try {
			await command.execute(interaction, config.config);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	});
}
bootstrap();
