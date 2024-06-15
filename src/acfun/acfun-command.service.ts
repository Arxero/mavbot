import { Injectable } from '@nestjs/common';
import { APIEmbedField, CacheType, CommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { ImgDownloaderService } from './img-downloader.service';
import { GameDig } from 'gamedig';
import { BotConfigService, Command, CommandReturn, CommandType, LoggerService, Player } from '@mavbot/core';
import moment from 'moment';

@Injectable()
export class AcfunCommandService implements Command {
	command: CommandType = new SlashCommandBuilder().setName('acfun').setDescription('Returns cs info');

	constructor(
		private logger: LoggerService,
		private config: BotConfigService,
		private imgDownloader: ImgDownloaderService,
	) {}

	async execute(interaction: CommandInteraction<CacheType>): CommandReturn {
		const { embedFile, gameType, host, port, maxAttempts, embedIP, embedColor, emdbedIconUrl } = this.config.acfun;

		try {
			// doing this approach because if request is slower than 3s it will crash the bot
			// https://stackoverflow.com/a/68774492/6743948
			await interaction.deferReply();
			const imgLocation = await this.imgDownloader.getImageByUrl(embedFile);
			const serverInfo = await GameDig.query({
				type: gameType,
				host: host,
				port: port,
				maxRetries: maxAttempts,
			});

			const embed = new EmbedBuilder()
				.setColor(embedColor)
				.setTitle(serverInfo.name)
				.setDescription(
					`Current Map: \`${serverInfo.map}\` \n IP Address: \`${embedIP || serverInfo.connect}\` \n Join: steam://connect/${
						serverInfo.connect
					}`,
				);

			this.tryAddPlayers(embed, serverInfo.players as Player[]);
			embed.setFooter({
				text: `Current Players: ${serverInfo.players.length} / ${serverInfo.maxplayers}`,
				iconURL: emdbedIconUrl,
			});

			return await interaction.editReply({
				embeds: [embed],
				files: imgLocation ? [imgLocation] : undefined,
			});
		} catch (error) {
			this.logger.error(`Error while fetching server data: ${error}`);
		}
	}

	private tryAddPlayers(message: EmbedBuilder, players: Player[]): void {
		if (!players.length) {
			return;
		}

		const fields: APIEmbedField[] = [
			{ name: 'Player Name', value: `${players.map(p => p.name || 'unknown').join('\n')}`, inline: true },
			{ name: 'Score', value: `${players.map(p => p.raw?.score || 0).join('\n')}`, inline: true },
			{
				name: 'Time',
				value: `${players.map(p => moment.utc((p.raw?.time || 0) * 1000).format('H:mm:ss')).join('\n')}`,
				inline: true,
			},
		];

		message.addFields(fields);
	}
}
