import 'reflect-metadata';
import { Client, Events } from 'discord.js';
import { commands, commandsReg } from './commands';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { PlayersCheckService } from './players-check.service';
import { ReflectiveInjector } from 'injection-js';
import { TopPlayersService } from './top-players.service';
import { clientReady, ConfigService, DbService, ImgDownloaderService, LoggerService } from './core';

async function bootstrap(): Promise<void> {
	const injector = ReflectiveInjector.resolveAndCreate([
		LoggerService, ConfigService, ImgDownloaderService, PlayersCheckService, TopPlayersService, DbService,
		{ provide: Client, useFactory: () => new Client({ intents: config.config.bot.intents }) }
	]);

	const config = injector.get(ConfigService) as ConfigService;
	const logger = injector.get(LoggerService) as LoggerService;
	const playersCheck = injector.get(PlayersCheckService) as PlayersCheckService;
	const db = injector.get(DbService) as DbService;
	const topPlayers = injector.get(TopPlayersService) as TopPlayersService;
	const client = injector.get(Client) as Client;
	const rest = new REST({ version: '10' }).setToken(config.config.bot.token);

	client.login(config.config.bot.token);
	config.loadConfigs();
	await clientReady(client, logger);
	await db.connect();
	playersCheck.startPlayersCheck();
	topPlayers.startDailyJob();


	try {
		await rest.put(Routes.applicationGuildCommands(config.config.bot.clientId, config.config.bot.guildId!), {
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
			await command.execute(interaction, injector);
			logger.log(`Command "${command.command.name}" has been used by ${interaction.member?.user.username}.`);
		} catch (error) {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			logger.error(`There was an error: ${error} while executing ${command.command.name} command!`);
		}
	});
}
bootstrap();
