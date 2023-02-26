import { Config } from './config';
import { ImageDownloader } from './img-downloader';
import { Client, Events } from 'discord.js';
import { commands, commandsReg } from './commands';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { DependencyResolver, DependencyType } from './dependency.resolver';
import { LoggerService } from './logger.service';

async function bootstrap(): Promise<void> {
	const resolver = new DependencyResolver();
	const logger = new LoggerService();
	const config = new Config(logger);

	resolver.register(DependencyType.Config, config);
	resolver.register(DependencyType.ImgDownloader, new ImageDownloader(logger));
	resolver.register(DependencyType.Logger, logger);

	await config.loadConfigs();

	const client = new Client({ intents: config.config.intents });
	client.login(config.config.token);

	client.on(Events.ClientReady, () => {
		logger.log(`Logged in as ${client.user?.tag}`);
	});

	const rest = new REST({ version: '10' }).setToken(config.config.token);

	try {
		await rest.put(Routes.applicationGuildCommands(config.config.clientId, config.config.guildId!), {
			body: commandsReg.map(c => c.command.toJSON()),
		});
		logger.log('Successfully registered application commands.');
	} catch (error) {
		logger.error(`Registering commands has failed with error: ${error}`);
	}

	client.on(Events.InteractionCreate, async interaction => {
		if (!interaction.isChatInputCommand()) {
			return;
		}

		const command = commands.get(interaction.commandName);

		if (!command) {
			return;
		}

		try {
			await command.execute(interaction, resolver);
			logger.log(`Command "${command.command.name}" has been used.`);
		} catch (error) {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			logger.error(`There was an error: ${error} while executing ${command.command.name} command!`);
		}
	});
}
bootstrap();
