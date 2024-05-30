import { Injectable } from '@nestjs/common';
import { BotSecrets, Config, ExternalConfig } from '../models';
import { LoggerService } from 'src/logger.service';
import { Colors, IntentsBitField } from 'discord.js';
import { delay } from 'src/utils';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BotConfigService {
	config: Config;
	private env: BotSecrets;

	constructor(
		private logger: LoggerService,
		private http: HttpService,
		private configService: ConfigService,
	) {
		this.env = this.configService.get<BotSecrets>('bot')!;

		if (!this.env.token || !this.env.appId || !this.env.serverId) {
			this.logger.error('Essential secrets were not supplied. Please fill them to continue! Exiting...');
			throw new Error();
		}

		this.config = {
			configRefreshTime: 300,
			bot: {
				token: this.env.token,
				clientId: this.env.appId,
				guildId: this.env.serverId,
				intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMembers],
			},
			acfun: {
				gameType: 'counterstrike16',
				host: 'ac.gamewaver.com',
				port: 27017,
				maxAttempts: 1,
				embedColor: Colors.White,
			},
			onlinePlayers: {
				checkInterval: 300,
				playersTreshhold: 1,
				channelId: '980871336350085120',
				embedMapColor: Colors.Blue,
				embedPlayersColor: Colors.Yellow,
				mapChangeText: 'map change 🗺️',
				playersCheckText: '{{ playersCount }} players in-game',
				playersCheckFieldText: '🔽',
				isEnabled: true,
			},
			topPlayers: {
				isEnabled: true,
				scoreThreshold: 5,
			},
		};
	}

	async loadConfigs(): Promise<void> {
		if (!this.env.acConfig) {
			this.logger.log('No AC_Config link was provided. Using defaults!');

			return;
		}

		try {
			const result = (await firstValueFrom(this.http.get<ExternalConfig>(this.env.acConfig))).data;
			this.config = { ...this.config, ...result };
			this.logger.log('Configs loaded successfully.');
		} catch (error) {
			this.logger.error(`Loading settings has failed with Error: ${error}`);
		}

		await delay(this.config.configRefreshTime, this.loadConfigs.bind(this));
	}
}
