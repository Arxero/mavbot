import { PlayerSessionEntity } from './player-session.entity';

export interface PlayerSession {
	name: string;
	joined: Date;
	score: number;
	left?: Date;
	timePlayed?: number;
	saved?: boolean;
	currentMapScore: number;
}
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
