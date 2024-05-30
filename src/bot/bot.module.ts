import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { LoggerService } from './../logger.service';
import { PlayerSessionEntity } from './player-session.entity';
import { Client, Events, REST, Routes } from 'discord.js';
import {
	BotConfigService,
	CanvasService,
	CommandsService,
	DbService,
	ImgDownloaderService,
	PlayersCheckService,
	TopPlayersService,
} from './services';

@Module({
	imports: [ConfigModule.forRoot(), HttpModule, TypeOrmModule.forFeature([PlayerSessionEntity])],
	providers: [
		ConfigService,
		BotConfigService,
		LoggerService,
		ImgDownloaderService,
		CanvasService,
		DbService,
		{
			provide: Client,
			useFactory: (config: BotConfigService): Client => new Client({ intents: config.config.bot.intents }),
			inject: [BotConfigService],
		},
		PlayersCheckService,
		TopPlayersService,
		CommandsService,
	],
})
export class BotModule implements OnModuleInit {
	private rest = new REST({ version: '10' }).setToken(this.config.config.bot.token);

	constructor(
		private config: BotConfigService,
		private client: Client,
		private logger: LoggerService,
		private commands: CommandsService,
		private playersCheck: PlayersCheckService,
		private topPlayers: TopPlayersService,
	) {}

	onModuleInit(): void {
		this.config.loadConfigs();
		this.client.login(this.config.config.bot.token);
		this.client.on(Events.ClientReady, () => {
			this.logger.log(`Logged in as ${this.client.user?.tag}`);
		});
		this.playersCheck.startPlayersCheck();
		this.topPlayers.startDailyJob();

		this.registerCommands();
		this.handleCommands();
	}

	private async registerCommands(): Promise<void> {
		try {
			await this.rest.put(Routes.applicationGuildCommands(this.config.config.bot.clientId, this.config.config.bot.guildId!), {
				body: this.commands.commandsReg.map(x => x.command.toJSON()),
			});
			this.logger.log('Successfully registered application commands.');
		} catch (error) {
			this.logger.error(`Registering commands has failed with error: ${error}`);
		}
	}

	private handleCommands(): void {
		this.client.on(Events.InteractionCreate, async interaction => {
			if (!interaction.isChatInputCommand()) {
				return;
			}

			const command = this.commands.commands.get(interaction.commandName);

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
