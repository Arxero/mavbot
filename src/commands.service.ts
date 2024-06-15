import { Injectable } from '@nestjs/common';
import { CacheType, Client, Collection, CommandInteraction, Events, REST, Routes, SlashCommandBuilder } from 'discord.js';
import { AcfunCommandService } from './acfun/acfun-command.service';
import { TopPlayersCommandService } from './top-players/top-players-command.service';
import { GameDealsCommandService } from './game-deals/game-deals-command.service';
import { BotConfigService, Command, CommandReturn, LoggerService } from '@mavbot/core';

@Injectable()
export class CommandsService {
	private rest = new REST({ version: '10' }).setToken(this.config.bot.token);
	private commands = new Collection<string, Command>();
	private pingCommand: Command = {
		command: new SlashCommandBuilder().setName('ping').setDescription('Returns pong'),
		execute(interaction: CommandInteraction<CacheType>): CommandReturn {
			return interaction.reply('pong');
		},
	};

	constructor(
		private logger: LoggerService,
		private config: BotConfigService,
		private client: Client,
		private acfunCommand: AcfunCommandService,
		private topPlayersCommand: TopPlayersCommandService,
		private gameDealsCommand: GameDealsCommandService,
	) {
		[this.acfunCommand, this.pingCommand, this.topPlayersCommand, this.gameDealsCommand].forEach(c => this.commands.set(c.command.name, c));
		this.registerCommands();
	}

	private async registerCommands(): Promise<void> {
		try {
			await this.rest.put(Routes.applicationGuildCommands(this.config.bot.appId, this.config.bot.serverId!), {
				body: Array.from(this.commands.values()).map(x => x.command.toJSON()),
			});
			this.logger.log('Successfully registered application commands.');
			this.handleCommands();
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
