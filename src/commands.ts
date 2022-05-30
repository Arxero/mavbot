import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { config } from './config';
import { Routes } from 'discord-api-types/v9';
import { Collection, CommandInteraction } from 'discord.js';

interface Command {
    command: SlashCommandBuilder,
    execute: (interaction: CommandInteraction) => Promise<void>,
}

const commandsReg: Command[] = [
    { 
        command: new SlashCommandBuilder().setName('ping').setDescription('Returns pong'),
        execute: (interaction) => interaction.reply('Pong'),
    }
];

export const commands = new Collection<string, Command>();

for (const command of commandsReg) {
    commands.set(command.command.name, command);
}

const rest = new REST({ version: '9' }).setToken(config.token!);

rest.put(Routes.applicationGuildCommands(config.clientId!, config.guildId!), { body: commandsReg.map(c => c.command.toJSON()) })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
