import { GameDig } from 'gamedig';
import { LoggerService } from 'src/logger.service';
import { Injectable } from '@nestjs/common';
import {
	Client,
	Collection,
	CommandInteraction,
	EmbedBuilder,
	Events,
	InteractionResponse,
	Message,
	REST,
	Routes,
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
	private rest = new REST({ version: '10' }).setToken(this.config.bot.token);

	constructor(
		private logger: LoggerService,
		private config: BotConfigService,
		private imgDownloader: ImgDownloaderService,
		private topPlayers: TopPlayersService,
		private client: Client,
	) {
		this.registerCommands();
		this.handleCommands();
	}

	commands = new Collection<string, Command>();
	commandsReg: Command[] = [
		{
			command: new SlashCommandBuilder().setName('ping').setDescription('Returns pong'),
			execute: (interaction: CommandInteraction) => interaction.reply('pong'),
		},
		{
			command: new SlashCommandBuilder().setName('acfun').setDescription('Returns cs info'),
			execute: async (interaction: CommandInteraction): Promise<Message | void> => {
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

					tryAddPlayers(embed, serverInfo.players as Player[]);
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

	private async registerCommands(): Promise<void> {
		try {
			await this.rest.put(Routes.applicationGuildCommands(this.config.bot.appId, this.config.bot.serverId!), {
				body: this.commandsReg.map(x => x.command.toJSON()),
			});
			this.logger.log('Successfully registered application commands.');
		} catch (error) {
			this.logger.error(`Registering commands has failed with error: ${error}`);
		}
	}

	private handleCommands(): void {
		this.client.on(Events.InteractionCreate, async interaction => {
			if (!interaction.isChatInputCommand()) {
				return;
			}

			const command = this.commands.get(interaction.commandName);

			if (!command) {
				return;
			}

			try {
				await command.execute(interaction);
				this.logger.log(`Command "${command.command.name}" has been used by ${interaction.member?.user.username}.`);
			} catch (error) {
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
				this.logger.error(`There was an error: ${error} while executing ${command.command.name} command!`);
			}
		});
	}
}
