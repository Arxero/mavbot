import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { LoggerService } from './../logger.service';
import { PlayerSessionEntity } from './player-session.entity';
import { Client } from 'discord.js';
import {
	AcfunCommandService,
	BotConfigService,
	CanvasService,
	CommandsService,
	DbService,
	ImgDownloaderService,
	PingCommandService,
	PlayersCheckService,
	TopPlayersCommandService,
	TopPlayersService,
} from './services';
import { clientReady } from 'src/utils';

@Module({
	imports: [ConfigModule.forRoot(), HttpModule, TypeOrmModule.forFeature([PlayerSessionEntity])],
	providers: [
		ConfigService,
		BotConfigService,
		LoggerService,
		ImgDownloaderService,
		CanvasService,
		DbService,
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
	],
})
export class BotModule {}
