import path from 'path';
import fs from 'fs';
import { Dictionary } from 'lodash';

export function ensureDirectory(directory: string, ...parents: string[]): void {
	const directoryPath = path.resolve(__dirname, ...parents, directory);

	if (!fs.existsSync(directoryPath)) {
		fs.mkdirSync(directoryPath);
	}
}

export async function delay(ms: number, callback?: () => void): Promise<void> {
	return new Promise<void>(resolve =>
		setTimeout(() => {
			if (callback) {
				callback();
			}
			resolve();
		}, ms * 1000),
	);
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
