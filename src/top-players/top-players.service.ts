import { Injectable } from '@nestjs/common';
import { AttachmentBuilder, BaseMessageOptions, Client, CommandInteraction, EmbedBuilder, TextChannel } from 'discord.js';
import { NumericDictionary } from 'lodash';
import moment from 'moment';
import { scheduleJob } from 'node-schedule';
import { PlayerSessionParams } from './player-session.entity';
import { TopPlayersDbService } from './top-players-db.service';
import { CanvasService } from './canvas.service';
import { BotConfigService, interpolate } from '@mavbot/core';
import { TopPlayersPeriod, TopPlayer, Medals } from './top-players.models';

@Injectable()
export class TopPlayersService {
	private messages: Record<
		TopPlayersPeriod,
		{ fallback: string; topPlayers: string; period: string; winMessageTitle?: string; winMessage?: string }
	> = {
		[TopPlayersPeriod.Today]: {
			fallback: 'No Top Players for today',
			topPlayers: 'Top Players of the Day',
			period: 'day',
			winMessageTitle: 'Player of the Day',
			winMessage: "Congrats to **{{ name }}** he/she is today's player of the day! 🥳",
		},
		[TopPlayersPeriod.Yesterday]: { fallback: 'No Top Players for yesterday', topPlayers: 'Top Players of Yesterday', period: 'day' },
		[TopPlayersPeriod.ThisWeek]: {
			fallback: 'No Top Players for this week',
			topPlayers: 'Top Players of the Week',
			period: 'week',
			winMessageTitle: 'Player of the Week',
			winMessage: "Congrats to **{{ name }}** he/she is this week's player of the week! 🥳 cc:<@153158947581198337>",
		},
		[TopPlayersPeriod.LastWeek]: {
			fallback: 'No Top Players for last week',
			topPlayers: 'Top Players of the Last Week ({{ time }})',
			period: 'last week',
		},
		[TopPlayersPeriod.ThisMonth]: { fallback: 'No Top Players for this month', topPlayers: 'Top Players of the Month', period: 'month' },
		[TopPlayersPeriod.LastMonth]: {
			fallback: 'No Top Players for last month',
			topPlayers: 'Top Players of the Last Month ({{ time }})',
			period: 'last month',
		},
	};

	private params: PlayerSessionParams;

	get twoTimes(): string {
		if (!this.params) {
			return '';
		}

		return `${moment(this.params.startDate).format('DD/MM/YYYY')} - ${moment(this.params.endDate).format('DD/MM/YYYY')}`;
	}

	constructor(
		private config: BotConfigService,
		private db: TopPlayersDbService,
		private client: Client,
		private canvas: CanvasService,
	) {
		this.startDailyJob();
	}

	async showTopPlayers(period: TopPlayersPeriod, interaction: CommandInteraction): Promise<void> {
		if (!this.config.topPlayers.isEnabled) {
			return;
		}

		let players = await this.getTopPlayers(period);
		let todayEmpty = false;

		if (!players.length && period === TopPlayersPeriod.Today) {
			period = TopPlayersPeriod.Yesterday;
			players = await this.getTopPlayers(period);
			todayEmpty = true;
		}

		const embed = this.createEmbed(players, period, todayEmpty);

		if (embed) {
			interaction.reply({ embeds: [embed] });
		} else if (!players.length && todayEmpty) {
			interaction.reply('No Top Players from today or yesterday. 😕');
		} else {
			interaction.reply(this.messages[period].fallback + ' 😕');
		}
	}

	private startDailyJob(): void {
		scheduleJob({ hour: 23, minute: 59, tz: 'Europe/Sofia' }, this.showTopPlayersDaily.bind(this));
	}

	private async showTopPlayersDaily(): Promise<void> {
		if (!this.config.topPlayers.isEnabled) {
			return;
		}

		let period = TopPlayersPeriod.Today;
		const isSunday = moment().isoWeekday() === 7;
		if (isSunday) {
			period = TopPlayersPeriod.ThisWeek;
		}

		const players = await this.getTopPlayers(period);
		if (!players.length) {
			return;
		}

		const name = players[0].name;
		const date = period === TopPlayersPeriod.Today ? moment().format('DD/MM/YYYY') : this.twoTimes;
		const image = await this.canvas.topPlayer(name, this.messages[period].winMessageTitle!.toUpperCase(), date);
		const attachment = new AttachmentBuilder(image, { name: `top-player-${name}.png` });
		const message: BaseMessageOptions = {
			content: interpolate(this.messages[period].winMessage!, { name }),
			files: [attachment],
			embeds: [this.createEmbed(players, period)!],
		};

		const channel = this.client.channels.cache.get(this.config.onlinePlayers.channelId) as TextChannel;
		channel.send(message);
	}

	private async getTopPlayers(period: TopPlayersPeriod): Promise<TopPlayer[]> {
		this.params = new PlayerSessionParams({
			scoreThreshold: this.config.topPlayers.scoreThreshold,
			time: period,
		});

		return (await this.db.findTopPlayers(this.params)).map(x => ({
			name: x.name,
			score: +x.totalScore,
			time: this.secondsToHours(x.totalTime),
		}));
	}

	private createEmbed(players: TopPlayer[], period: TopPlayersPeriod, todayEmpty?: boolean): EmbedBuilder | undefined {
		if (!players.length) {
			return;
		}

		const title = todayEmpty
			? 'No top players for today, showing from yesterday'
			: interpolate(this.messages[period].topPlayers, { time: this.twoTimes });

		return new EmbedBuilder()
			.setColor('#FFAB33')
			.setAuthor({
				name: title + ' 📊',
				iconURL: this.config.acfun.emdbedIconUrl,
			})
			.setDescription(
				`ℹ️ Based on their \`total playtime\` with a \`score ${this.params.scoreThreshold}\` or higher throughout the ${this.messages[period].period}.`,
			)
			.addFields([
				{ name: 'Name', value: `${this.namesWithBadges(players).join('\n')}`, inline: true },
				{ name: 'Time', value: `${players.map(p => p.time).join('\n')}`, inline: true },
				{ name: 'Score', value: `${players.map(p => p.score).join('\n')}`, inline: true },
			]);
	}

	private namesWithBadges(players: TopPlayer[]): string[] {
		const badges: NumericDictionary<Medals> = {
			1: Medals.Top1,
			2: Medals.Top2,
			3: Medals.Top3,
		};

		return players.map((p, i) => {
			const badge = badges[i + 1] || '';
			let name = `${badge} ${p.name}`;
			if (badge) {
				name = `\`${name}\``;
			}

			return name;
		});
	}

	private secondsToHours(seconds: number): string {
		const milliseconds = seconds * 1000;
		const hours = Math.floor(moment.duration(milliseconds).asHours());
		const minutesSeconds = moment.utc(milliseconds).format('mm:ss');

		return `${hours}:${minutesSeconds}`;
	}
}
