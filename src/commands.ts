import { SlashCommandBuilder } from '@discordjs/builders';
import { Collection, CommandInteraction, InteractionResponse, Message, EmbedBuilder } from 'discord.js';
import { query } from 'gamedig';
import { ConfigService } from './config.service';
import { DependencyResolver, DependencyType } from './dependency.resolver';
import { tryAddPlayers } from './helpers';
import { ImageDownloader } from './img-downloader';
import { LoggerService } from './logger.service';

interface Command {
	command: SlashCommandBuilder;
	execute: (interaction: CommandInteraction, resolver?: DependencyResolver) => Promise<InteractionResponse | Message | undefined>;
}

export const commands = new Collection<string, Command>();
export const commandsReg: Command[] = [
	{
		command: new SlashCommandBuilder().setName('ping').setDescription('Returns pong'),
		execute: (interaction: CommandInteraction) => interaction.reply('pong'),
	},
	{
		command: new SlashCommandBuilder().setName('acfun').setDescription('Returns cs info'),
		execute: async (interaction: CommandInteraction, resolver?: DependencyResolver): Promise<InteractionResponse | Message | undefined> => {
			const config = resolver!.resolve<ConfigService>(DependencyType.Config).config.acfun;
			const imgDownloader = resolver?.resolve<ImageDownloader>(DependencyType.ImgDownloader);
			const logger = resolver?.resolve<LoggerService>(DependencyType.Logger);

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

				tryAddPlayers(embed, serverInfo.players);
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
].map(command => {
	commands.set(command.command.name, command);

	return command;
});
