import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { LoggerService } from 'src/logger.service';
import { ProcessedGameDeal, RedditResponse, VendorType } from '../models';
import { BotConfigService } from './bot-config.service';
import { Dictionary, trim } from 'lodash';
import { delay } from 'src/utils';
import { GameDealsDbService } from './game-deals-db.service';
import { GameDealEntity } from '../game-deal.entity';
import { AttachmentBuilder, BaseMessageOptions, Client, CommandInteraction, EmbedBuilder, TextChannel } from 'discord.js';
import path from 'path';

@Injectable()
export class GameDealsService {
	constructor(
		private logger: LoggerService,
		private http: HttpService,
		private config: BotConfigService,
		private gameDealsDb: GameDealsDbService,
		private client: Client,
	) {
		this.getGameDeals();
	}

	async getGameDeals(interaction?: CommandInteraction): Promise<void> {
		if (!this.config.gameDeals.isEnabled) {
			return;
		}
		const url = `https://www.reddit.com/r/${this.config.gameDeals.subreddit}/hot.json?limit=25`;

		try {
			const posts = (await firstValueFrom(this.http.get<RedditResponse>(url))).data;
			this.processGameDeals(posts, interaction);
			this.logger.log('Gamde Deals loaded successfully.');
		} catch (error) {
			this.logger.error(`${GameDealsService.name} Loading Game Deals has failed with Error: ${error}`);
		} finally {
			if (!interaction) {
				await delay(this.config.gameDeals.checkInterval, this.getGameDeals.bind(this));
			}
		}
	}

	private processGameDeals(response: RedditResponse, interaction?: CommandInteraction): void {
		const regex = new RegExp('^\\[(steam|epic\\s*games|epic)](.+)\\((.*free.*)\\)', 'gmi');

		const gameDeals: ProcessedGameDeal[] = response.data.children
			.map(({ data }) => {
				const match = regex.exec(data.title);

				if (match) {
					return {
						id: data.id,
						thumbnail: data.preview?.images[0]?.source.url,
						title: trim(match[2]),
						url: data.url,
						type: match[1].toLowerCase().replace(/\s+/g, '') as VendorType,
						subreddit: data.subreddit,
					};
				}
			})
			.filter(x => !!x) as ProcessedGameDeal[];

		this.trySaveDeals(gameDeals, interaction);
	}

	private async trySaveDeals(deals: ProcessedGameDeal[], interaction?: CommandInteraction): Promise<void> {
		try {
			const savedDeals = await this.gameDealsDb.saveGameDeals(deals);
			this.showDeals(savedDeals, interaction);
		} catch (error) {
			this.logger.error(error);
		}
	}

	private showDeals(deals: GameDealEntity[], interaction?: CommandInteraction): void {
		if (!deals.length) {
			if (interaction) {
				interaction.reply('No new Game Deals. 😕');
			}

			return;
		}

		const message: BaseMessageOptions = {
			embeds: deals.map(d => this.createEmbed(d)),
			files: this.getFiles(deals),
		};

		if (interaction) {
			interaction.reply(message);

			return;
		}

		const channel = this.client.channels.cache.get(this.config.gameDeals.channelId) as TextChannel;
		channel.send(message);
	}

	private createEmbed(deal: GameDealEntity): EmbedBuilder {
		const imageMap: Dictionary<{ attachment: string; name: string }> = {
			[VendorType.Steam]: { attachment: 'attachment://steam_logo.png', name: 'Steam' },
			[VendorType.EpicGames]: { attachment: 'attachment://epic_games_logo.png', name: 'Epic Games' },
		};

		return new EmbedBuilder()
			.setColor('#4CAF50')
			.setTitle(`${deal.title} :arrow_upper_right:`)
			.setURL(deal.url)
			.setAuthor({
				name: `r/${deal.subreddit}`,
				iconURL: 'attachment://reddit_logo.png',
				url: `https://www.reddit.com/r/${deal.subreddit}/comments/${deal.redditId}`,
			})
			.setImage(this.decodeString(deal.thumbnail))
			.setThumbnail('attachment://free.png')
			.setFooter({ text: `Latest FREE game from ${imageMap[deal.type].name}`, iconURL: imageMap[deal.type].attachment });
	}

	private getImagePath(name: string): string {
		return path.join(__dirname, '..', '..', '..', '..', 'assets', `${name}.png`);
	}

	private decodeString(str?: string): string | null {
		if (!str) {
			return null;
		}

		const entities: Dictionary<string> = {
			['&amp;']: '&',
			['&lt;']: '<',
			['&gt;']: '>',
			['&quot;']: '"',
			['&#39;']: "'",
		};

		return str.replace(new RegExp('&[a-zA-Z0-9#]+;', 'g'), match => entities[match] || match);
	}

	private getFiles(deals: GameDealEntity[]): AttachmentBuilder[] {
		const files = [new AttachmentBuilder(this.getImagePath('reddit_logo')), new AttachmentBuilder(this.getImagePath('free'))];

		if (deals.some(d => d.type === VendorType.Steam)) {
			files.push(new AttachmentBuilder(this.getImagePath('steam_logo')));
		}
		if (deals.some(d => d.type === VendorType.EpicGames)) {
			files.push(new AttachmentBuilder(this.getImagePath('epic_games_logo')));
		}

		return files;
	}
}