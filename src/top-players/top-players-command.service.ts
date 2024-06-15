import { Injectable } from '@nestjs/common';
import { CacheType, CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { TopPlayersService } from './top-players.service';
import { Command, CommandReturn, CommandType, LoggerService } from '@mavbot/core';
import { TopPlayersPeriod } from './top-players.models';

@Injectable()
export class TopPlayersCommandService implements Command {
	command: CommandType = new SlashCommandBuilder()
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
		);

	constructor(
		private logger: LoggerService,
		private topPlayers: TopPlayersService,
	) {}

	async execute(interaction: CommandInteraction<CacheType>): CommandReturn {
		const period = (interaction.options.get('time')?.value || TopPlayersPeriod.Today) as TopPlayersPeriod;

		try {
			await this.topPlayers.showTopPlayers(period, interaction);
		} catch (error) {
			this.logger.error(`Error while getting top players: ${error}`);
		}
	}
}
