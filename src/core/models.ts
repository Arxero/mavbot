import { ColorResolvable } from 'discord.js';
import { Player as GamedigPlayer, Type } from 'gamedig';
import { FindOperator } from 'typeorm';
import { PlayerSessionEntity } from './player-session.entity';

interface BotConfig {
	token: string;
	clientId: string;
	guildId: string;
	intents: number[];
}

interface AcConfig {
	gameType: Type;
	host: string;
	port?: number;
	maxAttempts?: number;
	embedColor: ColorResolvable;
	embedIP?: string;
	emdbedIconUrl?: string;
	embedFile?: string;
}

interface OnlinePlayersConfig {
	checkInterval: number;
	playersTreshhold: number;
	channelId: string;
	embedMapColor: ColorResolvable;
	embedPlayersColor: ColorResolvable;
	mapChangeText: string;
	playersCheckText: string;
	playersCheckFieldText: string;
	isEnabled: boolean;
}

interface TopPlayersConfig {
	isEnabled: boolean;
	scoreThreshold: number;
}

export interface Config {
	configRefreshTime: number;
	bot: BotConfig;
	acfun: AcConfig;
	onlinePlayers: OnlinePlayersConfig;
	topPlayers: TopPlayersConfig;
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
    ThisMonth = 'month'
}

export enum Medals {
	Top1 = '🥇',
	Top2 = '🥈',
	Top3 = '🥉'
}
