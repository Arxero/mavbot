import { ColorResolvable, CommandInteraction, InteractionResponse, Message, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from 'discord.js';
import { Player as GamedigPlayer } from 'gamedig';
import { FindOperator } from 'typeorm';
import { PlayerSessionEntity } from './player-session.entity';

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
}

export interface PlayerSession {
	name: string;
	joined: Date;
	score: number;
	left?: Date;
	timePlayed?: number;
	saved?: boolean;
	currentMapScore: number;
}

export enum SortDirection {
	ASC = 'ASC',
	DESC = 'DESC',
}

export interface DbFilter {
	[key: string]: FindOperator<any>;
}

export type ExternalConfig = Omit<Config, 'bot'>;

export type Player = GamedigPlayer & { raw?: { score: number; time: number } };

export type TopPlayerDb = PlayerSessionEntity & { totalScore: string; totalTime: number };

export interface TopPlayer {
	name: string;
	score: number;
	time: string;
}

export enum TopPlayersPeriod {
	Today = 'day',
	Yesterday = 'yesterday',
	ThisWeek = 'week',
	ThisMonth = 'month',
	LastWeek = 'last_week',
	LastMonth = 'last_month',
}

export enum Medals {
	Top1 = '🥇',
	Top2 = '🥈',
	Top3 = '🥉',
}

export type CommandType = SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'> | SlashCommandOptionsOnlyBuilder;
export type CommandReturn = Promise<InteractionResponse | Message | void>;

export interface Command {
	command: CommandType;
	execute(interaction: CommandInteraction): CommandReturn;
}
