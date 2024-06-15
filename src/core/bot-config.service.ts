import { Injectable } from '@nestjs/common';
import { LoggerService } from 'src/core/logger.service';
import { IntentsBitField } from 'discord.js';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { delay } from './core.utils';
import { BotSecrets, Config } from './core.models';

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

	get gameDeals(): Pick<Config, 'gameDeals'>['gameDeals'] {
		return this.config.gameDeals;
	}

	get reddit(): { appId: string; secret: string; appName: string } {
		const { appId, secret, appName } = this.configService.get<{ appId: string; secret: string; appName: string }>('reddit') ?? {};

		if (!appId || !secret || !appName) {
			this.logger.error('Reddit secrets were not supplied. Please fill them!');
			throw new Error();
		}

		return { appId, secret, appName };
	}

	constructor(
		private logger: LoggerService,
		private http: HttpService,
		private configService: ConfigService,
	) {}

	async loadConfigs(): Promise<void> {
		try {
			this.config = (await firstValueFrom(this.http.get<Config>(this.bot.acConfig))).data;
			this.logger.log('Configs loaded successfully.');
		} catch (error) {
			this.logger.error(`Loading settings has failed with Error: ${error}`);
		} finally {
			this.scheduleNextLoad();
		}
	}

	private async scheduleNextLoad(): Promise<void> {
		await delay(this.config.configRefreshTime, this.loadConfigs.bind(this));
	}
}
