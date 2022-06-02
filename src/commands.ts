import { SlashCommandBuilder } from '@discordjs/builders';
import { Collection, CommandInteraction, MessageEmbed } from 'discord.js';
import { Player, query } from 'gamedig';
import moment from 'moment';
import { AcConfig, BaseConfig } from './config';

interface Command {
	command: SlashCommandBuilder;
	execute: (interaction: CommandInteraction, config?: BaseConfig) => Promise<void>;
}

export const commands = new Collection<string, Command>();
export const commandsReg: Command[] = [
	{
		command: new SlashCommandBuilder().setName('ping').setDescription('Returns pong'),
		execute: (interaction: CommandInteraction) => interaction.reply('Pong'),
	},
	{
		command: new SlashCommandBuilder().setName('acfun').setDescription('Returns cs info'),
		execute: async (interaction: CommandInteraction, config?: AcConfig): Promise<void> => {
			if (!config || !config.host) {
				return;
			}

			try {
				const serverInfo = await query({
					type: config.gameType || 'cs16',
					host: config.host,
					port: config.port || 27015,
					maxAttempts: config.maxAttempts,
				});

				const embed = new MessageEmbed()
					.setColor(config.embedColor || 'WHITE')
					.setTitle(serverInfo.name)
					.setDescription(
						`Current Map: \`${serverInfo.map}\` \n IP Address: \`${config.embedIP || serverInfo.connect}\` \n Join: steam://connect/${serverInfo.connect}`
					);

				tryAddPlayers(embed, serverInfo.players);
				embed.setFooter({ text: `Current Players: ${serverInfo.players.length} / ${serverInfo.maxplayers}`, iconURL: config.emdbedIconUrl });

				interaction.reply({
					files: [config.embedFile || ''],
					embeds: [embed],
				});
			} catch (error) {
				console.log(error);
			}
		},
	},
].map(command => {
	commands.set(command.command.name, command);

	return command;
});

function tryAddPlayers(message: MessageEmbed, players: Player[]): void {
	if (!players.length) {
		return;
	}

	message.addField('Player Name', `${players.map(p => p.name || 'unknown').join('\n')}`, true);
	message.addField('Score', `${players.map(p => (p.raw as any).score || 0).join('\n')}`, true);
	message.addField('Time', `${players.map(p => {
		let time = (p.raw as any).time || 0;
		if (time) {
			time = moment.utc(time * 1000).format('H:mm:ss');
		}

		return time;
	}).join('\n')}`, true);
}
