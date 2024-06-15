import { Injectable } from '@nestjs/common';
import { CacheType, CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { GameDealsService } from './game-deals.service';
import { Command, CommandReturn, CommandType, LoggerService } from '@mavbot/core';

@Injectable()
export class GameDealsCommandService implements Command {
	command: CommandType = new SlashCommandBuilder().setName('game-deals').setDescription('Returns free game deals');

	constructor(
		private logger: LoggerService,
		private gameDeals: GameDealsService,
	) {}

	async execute(interaction: CommandInteraction<CacheType>): CommandReturn {
		try {
			await this.gameDeals.getGameDeals(interaction);
		} catch (error) {
			this.logger.error(`Error while getting game deals: ${error}`);
		}
	}
}
