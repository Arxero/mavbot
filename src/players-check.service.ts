import { BaseMessageOptions, Client, EmbedBuilder, TextChannel } from 'discord.js';
import { query, QueryResult } from 'gamedig';
import { ConfigService } from './config.service';
import { interpolate } from './helpers';
import { LoggerService } from './logger.service';

export class PlayersCheckService {
	private currentMap?: string;

	constructor(private logger: LoggerService, private config: ConfigService) {}

	async startPlayersCheck(client: Client): Promise<void> {
		try {
			const channel = client.channels.cache.get(this.config.config.onlinePlayers.channelId) as TextChannel;
			const serverInfo = await query({
				type: this.config.config.acfun.gameType,
				host: this.config.config.acfun.host,
				port: this.config.config.acfun.port,
			});
			const showOnlinePlayers = serverInfo.players.length >= this.config.config.onlinePlayers.playersTreshhold;

			if (showOnlinePlayers) {
				channel.send(this.getPlayersMessage(serverInfo));
			}

			if (!this.currentMap) {
				this.currentMap = serverInfo.map;
			} else if (this.currentMap !== serverInfo.map && showOnlinePlayers) {
				this.currentMap = serverInfo.map;
				channel.send(this.getMapMessage(serverInfo));
			}
		} catch (error) {
			this.logger.error(`Error while fetching server data for ${PlayersCheckService.name}: ${error}`);
		}

		setTimeout(async () => {
			await this.startPlayersCheck(client);
		}, this.config.config.onlinePlayers.checkInterval * 1000);
	}

	private getMapMessage(data: QueryResult): BaseMessageOptions {
		const embed = new EmbedBuilder()
			.setColor(this.config.config.onlinePlayers.embedMapColor)
			.setAuthor({ name: data.map, iconURL: this.config.config.acfun.emdbedIconUrl })
			.setFooter({ text: this.config.config.onlinePlayers.mapChangeText });

		return {
			embeds: [embed],
		};
	}

	private getPlayersMessage(data: QueryResult): BaseMessageOptions {
		const embed = new EmbedBuilder()
			.setColor(this.config.config.onlinePlayers.embedPlayersColor)
			.setAuthor({
				name: `${interpolate(this.config.config.onlinePlayers.playersCheckText, { playersCount: data.players.length })}`,
				iconURL: this.config.config.acfun.emdbedIconUrl,
			})
			.addFields([
				{
					name: this.config.config.onlinePlayers.playersCheckFieldText,
					value: `${data.players.map(p => p.name || 'unknown').join('\n')}`,
					inline: true,
				},
			]);

		return {
			embeds: [embed],
		};
	}
}
