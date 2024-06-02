import { Injectable } from '@nestjs/common';
import { CacheType, CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command, CommandReturn, CommandType } from 'src/bot/models';

@Injectable()
export class PingCommandService implements Command {
	command: CommandType = new SlashCommandBuilder().setName('ping').setDescription('Returns pong');

	execute(interaction: CommandInteraction<CacheType>): CommandReturn {
		return interaction.reply('pong');
	}
}
