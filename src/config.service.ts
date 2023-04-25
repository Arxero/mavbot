import axios from 'axios';
import { ColorResolvable, Colors, IntentsBitField } from 'discord.js';
import { Type } from 'gamedig';
import { LoggerService } from './logger.service';

interface BotConfig {
	token: string;
	clientId: string;
	guildId: string;
	intents: number[];
}

interface AcConfig {
	gameType: Type;
	host: string;
	port?: number;
	maxAttempts?: number;
	embedColor: ColorResolvable;
	embedIP?: string;
	emdbedIconUrl?: string;
	embedFile?: string;
}

interface OnlinePlayersConfig {
	checkInterval: number;
	playersTreshhold: number;
	channelId: string;
	embedMapColor: ColorResolvable,
	embedPlayersColor: ColorResolvable,
	mapChangeText: string;
	playersCheckText: string;
	playersCheckFieldText: string;
}

export interface Config {
	bot: BotConfig;
	acfun: AcConfig;
	onlinePlayers: OnlinePlayersConfig;
	configRefreshTime: number;
}

type ExternalConfig = Pick<Config, 'acfun' | 'onlinePlayers' | 'configRefreshTime'>;

export class ConfigService {
	config: Config;

	constructor(private logger: LoggerService) {
		if (!process.env.BOT_TOKEN || !process.env.APPLICATION_ID || !process.env.SERVER_ID) {
			this.logger.error('Essential secrets were not supplied. Please fill them to continue! Exiting...');
			throw new Error();
		}

		this.config = {
			bot: {
				token: process.env.BOT_TOKEN,
				clientId: process.env.APPLICATION_ID,
				guildId: process.env.SERVER_ID,
				intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMembers],
			},
			acfun: {
				gameType: 'cs16',
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
			},
			configRefreshTime: 300,
		};
	}

	async loadConfigs(): Promise<void> {
		if (!process.env.AC_CONFIG) {
			this.logger.log('No AC_Config link was provided. Using defaults!');

			return;
		}

		try {
			const result = await (await axios.get<ExternalConfig>(process.env.AC_CONFIG)).data;
			this.config = { ...this.config, ...result };
			this.logger.log('Configs loaded successfully.');
		} catch (error) {
			this.logger.error(`Loading settings has failed with Error: ${error}`);
		}

		setInterval(async () => {
			await this.loadConfigs();
		}, this.config.configRefreshTime * 1000);
	}
}
