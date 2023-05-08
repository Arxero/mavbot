import { BaseMessageOptions, Client, EmbedBuilder, TextChannel } from 'discord.js';
import { query, QueryResult } from 'gamedig';
import { Injectable } from 'injection-js';
import { Dictionary } from 'lodash';
import moment from 'moment';
import { PlayerSession, LoggerService, ConfigService, interpolate, Player, delay, DbService } from './core';

@Injectable()
export class PlayersCheckService {
	private currentMap?: string;
	private playerSessions: Dictionary<PlayerSession[]> = {};
	private checkDate?: Date;

	constructor(private logger: LoggerService, private config: ConfigService, private client: Client, private db: DbService) {}

	async startPlayersCheck(): Promise<void> {
		if (!this.config.config.onlinePlayers.isEnabled) {
			return;
		}

		try {
			const channel = this.client.channels.cache.get(this.config.config.onlinePlayers.channelId) as TextChannel;
			const serverInfo = await query({
				type: this.config.config.acfun.gameType,
				host: this.config.config.acfun.host,
				port: this.config.config.acfun.port,
				maxAttempts: this.config.config.acfun.maxAttempts,
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
			await this.trySetPlayers(serverInfo.players as Player[]);
		} catch (error) {
			this.logger.error(`Error while fetching server data for ${PlayersCheckService.name}: ${error}`);
		}

		await delay(this.config.config.onlinePlayers.checkInterval, this.startPlayersCheck.bind(this, this.client));
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

	private async trySetPlayers(players: Player[]): Promise<void> {
        const namedPlayers = players.filter(x => !!x.name);
        if (this.checkDate?.getDay() !== moment().day()) {
            this.playerSessions = {};
		}
        
		for (const player of namedPlayers) {
			const current = this.playerSessions[player.name!];
			const activeSession = current?.find(s => !s.left);
			const playerSession: PlayerSession = {
				name: player.name!,
				score: player.raw?.score || 0,
				joined: moment().toDate(),
			};

			if (!current) {
				// first join of the day
				this.playerSessions[player.name!] = [playerSession];
			} else if (current.every(s => s.left)) {
				// every other separate join
				current.push(playerSession);
			} else if (activeSession) {
				// continuing to play
				activeSession.score += player.raw?.score || 0;
			}
		}

		for (const player in this.playerSessions) {
			const currentPlayerSessions = this.playerSessions[player];
			const activeSession = currentPlayerSessions?.find(s => !s.left);

			if (activeSession && !namedPlayers.some(p => p.name === activeSession.name)) {
				activeSession.left = moment().toDate();
                activeSession.timePlayed = +(moment(activeSession.left).diff(activeSession.joined) / 1000).toFixed(0);
				await this.save();
			}
		}

		this.checkDate = moment().toDate();
	}

	async save(): Promise<void> {
		const notSaved = Object.values(this.playerSessions).flat().filter(ps => !ps.saved && ps.left);
		await this.db.savePlayerSessions(notSaved);

		for (const session of notSaved) {
			const currentSessions = this.playerSessions[session.name].find(s => s.joined.toString() === session.joined.toString());
			if (currentSessions) {
				currentSessions.saved = true;
			}
		}	
	}
}
