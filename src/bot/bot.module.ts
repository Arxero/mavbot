import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { LoggerService } from './../logger.service';
import { PlayerSessionEntity } from './player-session.entity';
import { Client, Events } from 'discord.js';
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
			useFactory: (config: BotConfigService): Client => new Client({ intents: config.bot.intents }),
			inject: [BotConfigService],
		},
		PlayersCheckService,
		TopPlayersService,
		CommandsService,
		AcfunCommandService,
		PingCommandService,
		TopPlayersCommandService,
	],
})
export class BotModule implements OnModuleInit {
	constructor(
		private config: BotConfigService,
		private client: Client,
		private logger: LoggerService,
	) {}

	async onModuleInit(): Promise<void> {
		this.client.login(this.config.bot.token);

		this.client.on(Events.ClientReady, () => {
			this.logger.log(`Logged in as ${this.client.user?.tag}`);
		});
	}
}
