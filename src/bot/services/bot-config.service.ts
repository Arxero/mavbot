import { Injectable } from '@nestjs/common';
import { BotSecrets, Config, ExternalConfig } from '../models';
import { LoggerService } from 'src/logger.service';
import { IntentsBitField } from 'discord.js';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { delay } from 'src/utils';

@Injectable()
export class BotConfigService {
	private config: Config;

	get bot(): BotSecrets {
		const { token, appId, serverId, acConfig } = this.configService.get<BotSecrets>('bot') ?? {};

		if (!token || !appId || !serverId || !acConfig) {
			this.logger.error('Essential secrets were not supplied. Please fill them to continue! Exiting...');
			throw new Error();
		}

		return { token, appId, serverId, acConfig, intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMembers] };
	}

	get acfun(): Pick<Config, 'acfun'>['acfun'] {
		return this.config.acfun;
	}

	get onlinePlayers(): Pick<Config, 'onlinePlayers'>['onlinePlayers'] {
		return this.config.onlinePlayers;
	}

	get topPlayers(): Pick<Config, 'topPlayers'>['topPlayers'] {
		return this.config.topPlayers;
	}

	constructor(
		private logger: LoggerService,
		private http: HttpService,
		private configService: ConfigService,
	) {
		this.loadConfigs();
	}

	async loadConfigs(): Promise<void> {
		try {
			this.config = (await firstValueFrom(this.http.get<ExternalConfig>(this.bot.acConfig))).data;
			this.logger.log('Configs loaded successfully.');
		} catch (error) {
			this.logger.error(`Loading settings has failed with Error: ${error}`);
		} finally {
			await delay(this.config.configRefreshTime, this.loadConfigs.bind(this));
		}
	}
}
