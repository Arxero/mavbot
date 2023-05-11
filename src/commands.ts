import { SlashCommandBuilder } from '@discordjs/builders';
import { Collection, CommandInteraction, InteractionResponse, Message, EmbedBuilder } from 'discord.js';
import { query } from 'gamedig';
import { ReflectiveInjector } from 'injection-js';
import { ConfigService, ImgDownloaderService, LoggerService, Player, TopPlayersPeriod, tryAddPlayers } from './core';
import { TopPlayersService } from './top-players.service';

interface Command {
	command: SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
	execute: (interaction: CommandInteraction, injector: ReflectiveInjector) => Promise<InteractionResponse | Message | void>;
}

export const commands = new Collection<string, Command>();
export const commandsReg: Command[] = [
	{
		command: new SlashCommandBuilder().setName('ping').setDescription('Returns pong'),
		execute: (interaction: CommandInteraction) => interaction.reply('pong'),
	},
	{
		command: new SlashCommandBuilder().setName('acfun').setDescription('Returns cs info'),
		execute: async (interaction: CommandInteraction, injector?: ReflectiveInjector): Promise<Message | void> => {
			const config = (injector?.get(ConfigService) as ConfigService).config.acfun;
			const logger = injector?.get(LoggerService) as LoggerService;
			const imgDownloader = injector?.get(ImgDownloaderService) as ImgDownloaderService;

			try {
				// doing this approach because if request is slower than 3s it will crash the bot
				// https://stackoverflow.com/a/68774492/6743948
				await interaction.deferReply();
				const imgLocation = await imgDownloader?.getImageByUrl(config.embedFile);
				const serverInfo = await query({
					type: config.gameType,
					host: config.host,
					port: config.port,
					maxAttempts: config.maxAttempts,
				});

				const embed = new EmbedBuilder()
					.setColor(config.embedColor)
					.setTitle(serverInfo.name)
					.setDescription(
						`Current Map: \`${serverInfo.map}\` \n IP Address: \`${config.embedIP || serverInfo.connect}\` \n Join: steam://connect/${
							serverInfo.connect
						}`
					);

				tryAddPlayers(embed, serverInfo.players as Player[]);
				embed.setFooter({ text: `Current Players: ${serverInfo.players.length} / ${serverInfo.maxplayers}`, iconURL: config.emdbedIconUrl });

				return await interaction.editReply({
					embeds: [embed],
					files: imgLocation ? [imgLocation] : undefined,
				});
			} catch (error) {
				logger?.log(`Error while fetching server data: ${error}`);
			}
		},
	},
	{
		command: new SlashCommandBuilder()
			.setName('top-players')
			.setDescription('Returns top players of the day')
			.addStringOption(o => o.setName('time').setDescription('Top players in the given time period.').addChoices(
				{ name: 'Today', value: TopPlayersPeriod.Today },
				{ name: 'Yesterday', value: TopPlayersPeriod.Yesterday },
			)),
		execute: async (interaction: CommandInteraction, injector: ReflectiveInjector): Promise<void> => {
			const logger = injector?.get(LoggerService) as LoggerService;
			const topPlayers = injector?.get(TopPlayersService) as TopPlayersService;
			const period = (interaction.options.get('time')?.value || TopPlayersPeriod.Today) as TopPlayersPeriod;

			try {
				await topPlayers.showTopPlayers(period, interaction);
			} catch (error) {
				logger?.log(`Error while getting top players: ${error}`);
			}
		},
	},
].map(command => {
	commands.set(command.command.name, command);

	return command;
});
