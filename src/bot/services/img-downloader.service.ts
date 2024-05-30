import { Injectable } from '@nestjs/common';
import path from 'path';
import fs from 'fs';
import { firstValueFrom } from 'rxjs';
import { Stream } from 'stream';
import { ensureDirectory } from '../../utils';
import { LoggerService } from '../../logger.service';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ImgDownloaderService {
	private assets = 'assets';

	constructor(
		private logger: LoggerService,
		private http: HttpService,
	) {}

	async getImageByUrl(url?: string): Promise<string | undefined> {
		if (!url) {
			return;
		}

		ensureDirectory(this.assets, '..');
		const imagePath = path.resolve(__dirname, '..', '..', '..', this.assets, this.getFileName(url));

		try {
			const image = await firstValueFrom(this.http.get<Stream>(url, { responseType: 'stream' }));
			const writer = fs.createWriteStream(imagePath);
			image.data.pipe(writer);

			return new Promise((resolve, reject) => {
				writer.on('error', err => reject(new Error(`Saving downloaded image failed: ${err}`)));
				writer.on('finish', () => resolve(imagePath));
			});
		} catch (error) {
			this.logger.error(`Error while fetching image: ${error}`);
		}
	}

	private getFileName(url: string): string {
		const regex = /\/([^/]+)$/;
		const match = url.match(regex);

		if (match) {
			return match[1];
		}

		return 'banner.jpg';
	}
}
