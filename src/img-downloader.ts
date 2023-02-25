import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { Stream } from 'stream';

export class ImageDownloader {
	private assets = 'assets';

	constructor() {
		const assetsDirectory = path.resolve(__dirname, this.assets);

		if (!fs.existsSync(assetsDirectory)) {
			fs.mkdirSync(assetsDirectory);
		}
	}

	async getImageByUrl(url?: string): Promise<string | undefined> {
		if (!url) {
			return;
		}
		const imagePath = path.resolve(__dirname, this.assets, this.getFileName(url));

		try {
			const image = await axios.get<Stream>(url, { responseType: 'stream' });
			const writer = fs.createWriteStream(imagePath);
			image.data.pipe(writer);

			return new Promise((resolve, reject) => {
				writer.on('error', err => reject(new Error(`Saving downloaded image failed: ${err}`)));
				writer.on('finish', () => resolve(imagePath));
			});
		} catch (error) {
			console.log(`Error while fetching image: ${error}`);
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
