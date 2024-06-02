import { LoggerService } from 'src/logger.service';
import { Injectable } from '@nestjs/common';
import { Client, Collection, Events, REST, Routes } from 'discord.js';
import { BotConfigService } from '../bot-config.service';
import { Command } from '../../models';
import { AcfunCommandService } from './acfun-command.service';
import { PingCommandService } from './ping-command.service';
import { TopPlayersCommandService } from './top-players-command.service';

@Injectable()
export class CommandsService {
	private rest = new REST({ version: '10' }).setToken(this.config.bot.token);
	private commands = new Collection<string, Command>();

	constructor(
		private logger: LoggerService,
		private config: BotConfigService,
		private client: Client,
		private acfunCommand: AcfunCommandService,
		private pingCommand: PingCommandService,
		private topPlayersCommand: TopPlayersCommandService,
	) {
		[this.acfunCommand, this.pingCommand, this.topPlayersCommand].forEach(c => this.commands.set(c.command.name, c));
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
