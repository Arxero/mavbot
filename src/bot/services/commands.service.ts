import { GameDig } from 'gamedig';
import { LoggerService } from 'src/logger.service';
import { Injectable } from '@nestjs/common';
import {
	Collection,
	CommandInteraction,
	EmbedBuilder,
	InteractionResponse,
	Message,
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder,
} from 'discord.js';
import { BotConfigService } from './bot-config.service';
import { ImgDownloaderService } from './img-downloader.service';
import { TopPlayersService } from './top-players.service';
import { tryAddPlayers } from 'src/utils';
import { Player, TopPlayersPeriod } from '../models';

interface Command {
	command: SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'> | SlashCommandOptionsOnlyBuilder;
	execute: (interaction: CommandInteraction) => Promise<InteractionResponse | Message | void>;
}

@Injectable()
export class CommandsService {
	constructor(
		private logger: LoggerService,
		private botConfig: BotConfigService,
		private imgDownloader: ImgDownloaderService,
		private topPlayers: TopPlayersService,
	) {}

	commands = new Collection<string, Command>();
	commandsReg: Command[] = [
		{
			command: new SlashCommandBuilder().setName('ping').setDescription('Returns pong'),
			execute: (interaction: CommandInteraction) => interaction.reply('pong'),
		},
		{
			command: new SlashCommandBuilder().setName('acfun').setDescription('Returns cs info'),
			execute: async (interaction: CommandInteraction): Promise<Message | void> => {
				const config = this.botConfig.config.acfun;

				try {
					// doing this approach because if request is slower than 3s it will crash the bot
					// https://stackoverflow.com/a/68774492/6743948
					await interaction.deferReply();
					const imgLocation = await this.imgDownloader?.getImageByUrl(config.embedFile);
					const serverInfo = await GameDig.query({
						type: config.gameType,
						host: config.host,
						port: config.port,
						maxRetries: config.maxAttempts,
					});

					const embed = new EmbedBuilder()
						.setColor(config.embedColor)
						.setTitle(serverInfo.name)
						.setDescription(
							`Current Map: \`${serverInfo.map}\` \n IP Address: \`${config.embedIP || serverInfo.connect}\` \n Join: steam://connect/${
								serverInfo.connect
							}`,
						);

					tryAddPlayers(embed, serverInfo.players as Player[]);
					embed.setFooter({
						text: `Current Players: ${serverInfo.players.length} / ${serverInfo.maxplayers}`,
						iconURL: config.emdbedIconUrl,
					});

					return await interaction.editReply({
						embeds: [embed],
						files: imgLocation ? [imgLocation] : undefined,
					});
				} catch (error) {
					this.logger.error(`Error while fetching server data: ${error}`);
				}
			},
		},
		{
			command: new SlashCommandBuilder()
				.setName('top-players')
				.setDescription('Returns top players of the day or in given a time period')
				.addStringOption(o =>
					o
						.setName('time')
						.setDescription('Top players in the given time period.')
						.addChoices(
							{ name: 'Today', value: TopPlayersPeriod.Today },
							{ name: 'Yesterday', value: TopPlayersPeriod.Yesterday },
							{ name: 'This Week', value: TopPlayersPeriod.ThisWeek },
							{ name: 'Last Week', value: TopPlayersPeriod.LastWeek },
							{ name: 'This Month', value: TopPlayersPeriod.ThisMonth },
							{ name: 'Last Month', value: TopPlayersPeriod.LastMonth },
						),
				),
			execute: async (interaction: CommandInteraction): Promise<void> => {
				const period = (interaction.options.get('time')?.value || TopPlayersPeriod.Today) as TopPlayersPeriod;

				try {
					await this.topPlayers.showTopPlayers(period, interaction);
				} catch (error) {
					this.logger.error(`Error while getting top players: ${error}`);
				}
			},
		},
	].map(command => {
		this.commands.set(command.command.name, command);

		return command;
	});
}
