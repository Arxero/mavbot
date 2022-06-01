import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { config } from './config';
import { Routes } from 'discord-api-types/v9';
import { Collection, CommandInteraction, MessageEmbed } from 'discord.js';
import { Player, query } from 'gamedig';
import moment from 'moment';

interface Command {
	command: SlashCommandBuilder;
	execute: (interaction: CommandInteraction) => Promise<void>;
}

export const commands = new Collection<string, Command>();
const commandsReg: Command[] = [
	{
		command: new SlashCommandBuilder().setName('ping').setDescription('Returns pong'),
		execute: (interaction: CommandInteraction) => interaction.reply('Pong'),
	},
	{
		command: new SlashCommandBuilder().setName('acfun').setDescription('Returns cs info'),
		execute: async (interaction: CommandInteraction): Promise<void> => {
			try {
				const serverInfo = await query({
					type: config.gameType,
					host: config.host,
					port: config.port,
					maxAttempts: config.maxAttempts,
				});

				const embed = new MessageEmbed()
					.setColor(config.embedColor)
					.setTitle(serverInfo.name)
					.setDescription(
						`Current Map: \`${serverInfo.map}\` \n IP Address: \`${config.embedIP}\` \n Join: steam://connect/${serverInfo.connect}`
					);

				tryAddPlayers(embed, serverInfo.players);
				embed.setFooter({ text: `Current Players: ${serverInfo.players.length} / ${serverInfo.maxplayers}`, iconURL: config.emdbedIconUrl });

				interaction.reply({
					files: [config.embedFile],
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

const rest = new REST({ version: '9' }).setToken(config.token!);
rest.put(Routes.applicationGuildCommands(config.clientId!, config.guildId!), { body: commandsReg.map(c => c.command.toJSON()) })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);

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
