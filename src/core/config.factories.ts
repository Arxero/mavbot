import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Client, Events } from 'discord.js';
import { LoggerService } from 'src/core/logger.service';
import { BotConfigService } from './bot-config.service';

export async function botConfigServiceFactory(config: ConfigService, http: HttpService, logger: LoggerService): Promise<BotConfigService> {
	const botConfigService = new BotConfigService(logger, http, config);
	await botConfigService.loadConfigs();

	return botConfigService;
}

export async function clientFactory(config: BotConfigService, logger: LoggerService): Promise<Client> {
	const client = new Client({ intents: config.bot.intents });
	client.login(config.bot.token);

	await new Promise<void>(resolve => {
		client.once(Events.ClientReady, () => resolve());
	});

	logger.log(`Logged in as ${client.user?.tag}`);

	return client;
}
