import axios from 'axios';
import { ColorResolvable, IntentsBitField } from 'discord.js';
import { Type } from 'gamedig';
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

	constructor() {
		if (!process.env.BOT_TOKEN || !process.env.APPLICATION_ID || !process.env.SERVER_ID) {
			throw new Error('Essential secrets were not supplied. Please fill them to continue!');
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
			console.log('No AC_Config link was provided.');

			return;
		}

		try {
			const result = await (await axios.get<AcConfig>(process.env.AC_CONFIG)).data;
			this.config = { ...this.config, ...result };
            console.log('Configs loaded successfully.');
		} catch (error) {
			console.log(`Loading settings has failed with Error: ${error}`);
		}

		setTimeout(async () => {
			await this.loadConfigs();
		}, (this.config.refreshTime || 300) * 1000);
	}
}
