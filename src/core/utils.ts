import path from 'path';
import fs from 'fs';
import { APIEmbedField, Client, EmbedBuilder, Events } from 'discord.js';
import { LoggerService } from './logger.service';
import moment from 'moment';
import { Dictionary } from 'lodash';
import { Player } from './models';

export abstract class FileHelper {
	ensureDirectory(directory: string, ...parents: string[]): void {
		const directoryPath = path.resolve(__dirname, ...parents, directory);

		if (!fs.existsSync(directoryPath)) {
			fs.mkdirSync(directoryPath);
		}
	}
}

export function clientReady(client: Client, logger: LoggerService): Promise<void> {
	return new Promise(resolve => {
		client.on(Events.ClientReady, () => {
			logger.log(`Logged in as ${client.user?.tag}`);
			resolve();
		});
	});
}

export async function delay(ms: number, callback?: () => void): Promise<void> {
	return new Promise<void>(resolve =>
		setTimeout(() => {
			if (callback) {
				callback();
			}
			resolve();
		}, ms * 1000)
	);
}

export function tryAddPlayers(message: EmbedBuilder, players: Player[]): void {
	if (!players.length) {
		return;
	}

	const fields: APIEmbedField[] = [
		{ name: 'Player Name', value: `${players.map(p => p.name || 'unknown').join('\n')}`, inline: true },
		{ name: 'Score', value: `${players.map(p => p.raw?.score || 0).join('\n')}`, inline: true },
		{
			name: 'Time',
			value: `${players.map(p => moment.utc((p.raw?.time || 0) * 1000).format('H:mm:ss')).join('\n')}`,
			inline: true,
		},
	];

	message.addFields(fields);
}

export function interpolate(str: string, params: Dictionary<string | number>): string {
	if (!str) {
		return '';
	}

	for (const key in params) {
		const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
		str = str.replace(regex, params[key].toString());
	}

	return str;
}

export function secondsToHours(seconds: number): string {
	const milliseconds = seconds * 1000;
	const hours = Math.floor(moment.duration(milliseconds).asHours());
	const minutesSeconds = moment.utc(milliseconds).format('mm:ss');

	return `${hours}:${minutesSeconds}`;
}
