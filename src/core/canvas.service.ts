import { Canvas, createCanvas, loadImage } from '@napi-rs/canvas';
import { Injectable } from 'injection-js';

@Injectable()
export class CanvasService {
	async topPlayer(name: string, period: string, date: string): Promise<Buffer> {
		const canvas = createCanvas(700, 250);
		const context = canvas.getContext('2d');
		const background = await loadImage(this.getImagePath('canvas'));
		const logo = await loadImage(this.getImagePath('logo', 'png'));
		const logoSize = 200;

		context.drawImage(background, 0, 0, canvas.width, canvas.height);
		context.fillStyle = 'white';
        context.font = this.getFont(20);
        context.fillText(period, (canvas.width + 6) / 2.5, canvas.height / 2.3);
    
        context.font = this.applyText(canvas, name);
        context.fillText(name, canvas.width / 2.5, canvas.height / 1.5);

        context.font = this.getFont(16);
        const dateLength = context.measureText(date).width + 10;
        context.fillText(date, canvas.width - dateLength, canvas.height - 10);

		context.beginPath();
		context.arc(canvas.width / 2 - 200, canvas.height / 2, 100, 0, Math.PI * 2, true);
		context.fill();
		context.closePath();
		context.clip();

		const x = (canvas.width - logoSize) / 2 - 200;
		const y = (canvas.height - logoSize) / 2;
		context.drawImage(logo, x, y, logoSize, logoSize);

        return await canvas.toBuffer('image/png');
	}

    private getFont(size: number): string {
        return `${size}px Arial`;
    }

	private getImagePath(name: string, extension: 'jpg' | 'png' = 'jpg'): string {
		return `./src/assets/${name}.${extension}`;
	}

    private applyText(canvas: Canvas, text: string): string {
        const context = canvas.getContext('2d');
        let fontSize = 70;
    
        do {
            context.font = this.getFont(fontSize -=10);
        } while (context.measureText(text).width > canvas.width - 300);
    
        return context.font;
    };
}
