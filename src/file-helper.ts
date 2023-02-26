import path from 'path';
import fs from 'fs';

export abstract class FileHelper {
	ensureDirectory(directory: string): void {
		const directoryPath = path.resolve(__dirname, directory);

		if (!fs.existsSync(directoryPath)) {
			fs.mkdirSync(directoryPath);
		}
	}
}
