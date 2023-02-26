import axios from 'axios';
import { ColorResolvable, IntentsBitField } from 'discord.js';
import { Type } from 'gamedig';
import { LoggerService } from './logger.service';
export interface BaseConfig {
	token: string;
	clientId: string;
	guildId: string;
	intents: number[];
}
export interface AcConfig extends BaseConfig {
	gameType?: Type;
	host?: string;
	port?: number;
	maxAttempts?: number;

	embedColor?: ColorResolvable;
	embedIP?: string;
	emdbedIconUrl?: string;
	embedFile?: string;
	refreshTime?: number;
}
export class Config {
	config: AcConfig;

	constructor(private logger: LoggerService) {
		if (!process.env.BOT_TOKEN || !process.env.APPLICATION_ID || !process.env.SERVER_ID) {
			this.logger.error('Essential secrets were not supplied. Please fill them to continue! Exiting...');
			throw new Error();
		}

		this.config = {
			token: process.env.BOT_TOKEN,
			clientId: process.env.APPLICATION_ID,
			guildId: process.env.SERVER_ID,
			intents: [IntentsBitField.Flags.Guilds],
		} as AcConfig;
	}

	async loadConfigs(): Promise<void> {
		if (!process.env.AC_CONFIG) {
			this.logger.log('No AC_Config link was provided.');

			return;
		}

		try {
			const result = await (await axios.get<AcConfig>(process.env.AC_CONFIG)).data;
			this.config = { ...this.config, ...result };
            this.logger.log('Configs loaded successfully.');
		} catch (error) {
			this.logger.error(`Loading settings has failed with Error: ${error}`);
		}

		setTimeout(async () => {
			await this.loadConfigs();
		}, (this.config.refreshTime || 300) * 1000);
	}
}
