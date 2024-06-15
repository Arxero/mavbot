import { HttpModule, HttpService } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Client } from 'discord.js';
import { LoggerService } from 'src/core/logger.service';
import { botConfigServiceFactory, clientFactory } from './config.factories';
import { BotConfigService } from './bot-config.service';

@Module({
	imports: [ConfigModule.forRoot(), HttpModule],
	providers: [
		ConfigService,
		LoggerService,
		{
			provide: BotConfigService,
			useFactory: botConfigServiceFactory,
			inject: [ConfigService, HttpService, LoggerService],
		},
		{
			provide: Client,
			useFactory: clientFactory,
			inject: [BotConfigService, LoggerService],
		},
	],
	exports: [LoggerService, BotConfigService, Client],
})
export class CoreModule {}
