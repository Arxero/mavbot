import { SlashCommandBuilder } from '@discordjs/builders';
import { Collection, CommandInteraction, InteractionResponse, Message, EmbedBuilder, Colors, APIEmbedField } from 'discord.js';
import { Player, query } from 'gamedig';
import moment from 'moment';
import { AcConfig, BaseConfig } from './config';

interface Command {
	command: SlashCommandBuilder;
	execute: (interaction: CommandInteraction, config?: BaseConfig) => Promise<InteractionResponse | Message | undefined>;
}

export const commands = new Collection<string, Command>();
export const commandsReg: Command[] = [
	{
		command: new SlashCommandBuilder().setName('ping').setDescription('Returns pong'),
		execute: (interaction: CommandInteraction) => interaction.reply('Pong'),
	},
	{
		command: new SlashCommandBuilder().setName('acfun').setDescription('Returns cs info'),
		execute: async (interaction: CommandInteraction, config?: AcConfig): Promise<InteractionResponse | Message | undefined> => {
			if (!config) {
				config = {} as AcConfig;
				console.log('Config for acfun command was not provided, therefore using defaults.');
			}

			try {
				// doing this approach because if request is slower than 3s it will crash the bot
				// https://stackoverflow.com/a/68774492/6743948
				await interaction.deferReply();
				const serverInfo = await query({
					type: config.gameType || 'cs16',
					host: config.host || 'ac.gamewaver.com',
					port: config.port || 27017,
					maxAttempts: config.maxAttempts || 1,
				});

				const embed = new EmbedBuilder()
					.setColor(config.embedColor || Colors.White)
					.setTitle(serverInfo.name)
					.setDescription(
						`Current Map: \`${serverInfo.map}\` \n IP Address: \`${config.embedIP || serverInfo.connect}\` \n Join: steam://connect/${serverInfo.connect}`
					);

				tryAddPlayers(embed, serverInfo.players);
				embed.setFooter({ text: `Current Players: ${serverInfo.players.length} / ${serverInfo.maxplayers}`, iconURL: config.emdbedIconUrl });
				
				return await interaction.editReply({
					embeds: [embed],
					files: [config.embedFile || '']
				});
			} catch (error) {
				console.log(`Error while fetching server data: ${error}`);
			}
		},
	},
].map(command => {
	commands.set(command.command.name, command);

	return command;
});

function tryAddPlayers(message: EmbedBuilder, players: Player[]): void {
	if (!players.length) {
		return;
	}

	const fields: APIEmbedField[] = [
		{ name: 'Player Name', value: `${players.map(p => p.name || 'unknown').join('\n')}`, inline: true },
		{ name: 'Score', value: `${players.map(p => (p.raw as any).score || 0).join('\n')}`, inline: true },
		{ name: 'Time', value: `${players.map(p => {
			let time = (p.raw as any).time || 0;
			if (time) {
				time = moment.utc(time * 1000).format('H:mm:ss');
			}
	
			return time;
		}).join('\n')}`, inline: true },
	];

	message.addFields(fields);
}
