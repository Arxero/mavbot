import { AttachmentBuilder, BaseMessageOptions, Client, CommandInteraction, EmbedBuilder, TextChannel } from 'discord.js';
import { Injectable } from 'injection-js';
import { NumericDictionary } from 'lodash';
import moment from 'moment';
import { scheduleJob } from 'node-schedule';
import { CanvasService, ConfigService, DbService, interpolate, Medals, PlayerSessionParams, TopPlayer, TopPlayersPeriod } from './core';

@Injectable()
export class TopPlayersService {
	private messages: Record<TopPlayersPeriod, { fallback: string; topPlayers: string; period: string }> = {
		[TopPlayersPeriod.Today]: { fallback: 'No Top Players for today', topPlayers: 'Top Players of the Day', period: 'day' },
		[TopPlayersPeriod.Yesterday]: { fallback: 'No Top Players for yesterday', topPlayers: 'Top Players of Yesterday', period: 'day' },
		[TopPlayersPeriod.ThisWeek]: { fallback: 'No Top Players for this week', topPlayers: 'Top Players of the Week', period: 'week' },
		[TopPlayersPeriod.LastWeek]: { fallback: 'No Top Players for last week', topPlayers: 'Top Players of the Last Week ({{ time }})', period: 'last week' },
		[TopPlayersPeriod.ThisMonth]: { fallback: 'No Top Players for this month', topPlayers: 'Top Players of the Month', period: 'month' },
		[TopPlayersPeriod.LastMonth]: { fallback: 'No Top Players for last month', topPlayers: 'Top Players of the Last Month ({{ time }})', period: 'last month' },
	};
	
	private params: PlayerSessionParams;

	constructor(private config: ConfigService, private db: DbService, private client: Client, private canvas: CanvasService) {}

	async showTopPlayers(period: TopPlayersPeriod, interaction: CommandInteraction): Promise<void> {
		if (!this.config.config.topPlayers.isEnabled) {
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

	startDailyJob(): void {
		scheduleJob({ hour: 23, minute: 59, tz: 'Europe/Sofia' }, this.showTopPlayersDaily.bind(this));
	}

	private async showTopPlayersDaily(): Promise<void> {
		if (!this.config.config.topPlayers.isEnabled) {
			return;
		}

		const players = await this.getTopPlayers(TopPlayersPeriod.Today);
		if (!players.length) {
			return;
		}

		const name = players[0].name;
		const image = await this.canvas.topPlayer(name, 'PLAYER OF THE DAY', moment().format('DD/MM/YYYY'));
		const attachment = new AttachmentBuilder(image, { name: `top-player-${name}.png` });
		const message: BaseMessageOptions = {
			content: `Congrats to **${name}** he/she is today's player of the day! 🥳`,
			files: [attachment],
			embeds: [this.createEmbed(players, TopPlayersPeriod.Today)!],
		};

		const channel = this.client.channels.cache.get(this.config.config.onlinePlayers.channelId) as TextChannel;
		channel.send(message);
	}

	private async getTopPlayers(period: TopPlayersPeriod): Promise<TopPlayer[]> {
		this.params = new PlayerSessionParams({
			scoreThreshold: this.config.config.topPlayers.scoreThreshold,
			time: period,
		});

		return await (
			await this.db.findTopPlayers(this.params)
		).map(x => ({
			name: x.name,
			score: +x.totalScore,
			time: moment.utc(x.totalTime * 1000).format('H:mm:ss'),
		}));
	}

	private createEmbed(players: TopPlayer[], period: TopPlayersPeriod, todayEmpty?: boolean): EmbedBuilder | undefined {
		if (!players.length) {
			return;
		}

		const time = `${moment(this.params.startDate).format('DD/MM/YYYY')} - ${moment(this.params.endDate).format('DD/MM/YYYY')}`;
		const title = todayEmpty ? 'No top players for today, showing from yesterday' : interpolate(this.messages[period].topPlayers, { time });

		return new EmbedBuilder()
			.setColor('#FFAB33')
			.setAuthor({
				name: title + ' 📊',
				iconURL: this.config.config.acfun.emdbedIconUrl,
			})
			.setDescription(`ℹ️ Based on their \`total playtime\` with a \`score ${this.params.scoreThreshold}\` or higher throughout the ${this.messages[period].period}.`)
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
}
