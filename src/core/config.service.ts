import axios from 'axios';
import { Colors, IntentsBitField } from 'discord.js';
import { Injectable } from 'injection-js';
import { delay } from './utils';
import { LoggerService } from './logger.service';
import { Config, ExternalConfig } from './models';

@Injectable()
export class ConfigService {
	config: Config;

	constructor(private logger: LoggerService) {
		if (!process.env.BOT_TOKEN || !process.env.APPLICATION_ID || !process.env.SERVER_ID) {
			this.logger.error('Essential secrets were not supplied. Please fill them to continue! Exiting...');
			throw new Error();
		}

		this.config = {
			configRefreshTime: 300,
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
				isEnabled: true,
			},
			topPlayers: {
				isEnabled: true,
				scoreThreshold: 5,
			}
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

		await delay(this.config.configRefreshTime, this.loadConfigs.bind(this));
	}
}
