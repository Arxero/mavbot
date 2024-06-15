import { ColorResolvable, CommandInteraction, InteractionResponse, Message, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from 'discord.js';
import { Player as GamedigPlayer } from 'gamedig';

export interface BotSecrets {
	token: string;
	appId: string;
	serverId: string;
	acConfig: string;
	intents: number[];
}

export interface Config {
	configRefreshTime: number;
	acfun: {
		gameType: string;
		host: string;
		port?: number;
		maxAttempts?: number;
		embedColor: ColorResolvable;
		embedIP?: string;
		emdbedIconUrl?: string;
		embedFile?: string;
	};
	onlinePlayers: {
		checkInterval: number;
		playersTreshhold: number;
		channelId: string;
		embedMapColor: ColorResolvable;
		embedPlayersColor: ColorResolvable;
		mapChangeText: string;
		playersCheckText: string;
		playersCheckFieldText: string;
		isEnabled: boolean;
	};
	topPlayers: {
		isEnabled: boolean;
		scoreThreshold: number;
	};
	gameDeals: {
		isEnabled: boolean;
		checkInterval: number;
		subreddit: string;
		channelId: string;
	};
}

export enum SortDirection {
	ASC = 'ASC',
	DESC = 'DESC',
}

export type CommandType = SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'> | SlashCommandOptionsOnlyBuilder;
export type CommandReturn = Promise<InteractionResponse | Message | void>;

export interface Command {
	command: CommandType;
	execute(interaction: CommandInteraction): CommandReturn;
}

export type Player = GamedigPlayer & { raw?: { score: number; time: number } };
