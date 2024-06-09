import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule, HttpService } from '@nestjs/axios';
import { LoggerService } from './../logger.service';
import { PlayerSessionEntity } from './player-session.entity';
import { Client } from 'discord.js';
import {
	AcfunCommandService,
	BotConfigService,
	CanvasService,
	CommandsService,
	TopPlayersDbService,
	GameDealsDbService,
	GameDealsService,
	ImgDownloaderService,
	PingCommandService,
	PlayersCheckService,
	TopPlayersCommandService,
	TopPlayersService,
	GameDealsCommandService,
} from './services';
import { clientReady } from 'src/utils';
import { GameDealEntity } from './game-deal.entity';

@Module({
	imports: [ConfigModule.forRoot(), HttpModule, TypeOrmModule.forFeature([PlayerSessionEntity, GameDealEntity])],
	providers: [
		ConfigService,
		{
			provide: BotConfigService,
			useFactory: async (config: ConfigService, http: HttpService, logger: LoggerService): Promise<BotConfigService> => {
				const botConfigService = new BotConfigService(logger, http, config);
				await botConfigService.loadConfigs();

				return botConfigService;
			},
			inject: [ConfigService, HttpService, LoggerService],
		},
		LoggerService,
		ImgDownloaderService,
		CanvasService,
		TopPlayersDbService,
		{
			provide: Client,
			useFactory: async (config: BotConfigService, logger: LoggerService): Promise<Client> => {
				const client = new Client({ intents: config.bot.intents });
				client.login(config.bot.token);
				await clientReady(client, logger);

				return client;
			},
			inject: [BotConfigService, LoggerService],
		},
		PlayersCheckService,
		TopPlayersService,
		CommandsService,
		AcfunCommandService,
		PingCommandService,
		TopPlayersCommandService,
		GameDealsService,
		GameDealsDbService,
		GameDealsCommandService,
	],
})
export class BotModule {}
