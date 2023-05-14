/* eslint-disable @typescript-eslint/no-unused-vars */
import { Canvas, createCanvas, loadImage } from '@napi-rs/canvas';
import { AttachmentBuilder, CommandInteraction } from 'discord.js';
import { Injectable } from 'injection-js';

@Injectable()
export class CanvasService {
	async topPlayer(interaction: CommandInteraction): Promise<void> {
		const canvas = createCanvas(700, 250);
		const context = canvas.getContext('2d');
		const background = await loadImage(this.getImagePath('canvas'));
		const logo = await loadImage(this.getImagePath('logo', 'png'));
		const logoSize = 200;

		context.drawImage(background, 0, 0, canvas.width, canvas.height);
		// context.strokeRect(0, 0, canvas.width, canvas.height);
        // context.strokeStyle = '#0099ff';
		// context.strokeRect(0, 0, canvas.width, canvas.height);

		context.fillStyle = 'white';
        context.font = '20px Arial';
        context.fillText('PLAYER OF THE DAY', (canvas.width + 6) / 2.5, canvas.height / 2.3);
    
        context.font = this.applyText(canvas, 'Maverick');
        context.fillText('Maverick', canvas.width / 2.5, canvas.height / 1.5);

        context.font = '16px Arial';
        context.fillText('14/05/2023', canvas.width - 90, canvas.height - 10);

		context.beginPath();
		context.arc(canvas.width / 2 - 200, canvas.height / 2, 100, 0, Math.PI * 2, true);
		context.fill();
		context.closePath();
		context.clip();

		const x = (canvas.width - logoSize) / 2 - 200;
		const y = (canvas.height - logoSize) / 2;
		context.drawImage(logo, x, y, logoSize, logoSize);


		const attachment = new AttachmentBuilder(await canvas.toBuffer('image/png'), { name: 'profile-image.png' });
		interaction.reply({ files: [attachment] });

        // const channel = this.client.channels.cache.get('') as TextChannel;
        // channel.send({ files: [attachment] });

	}

	private getImagePath(name: string, extension: 'jpg' | 'png' = 'jpg'): string {
		return `./src/assets/${name}.${extension}`;
	}

    private applyText(canvas: Canvas, text: string): string {
        const context = canvas.getContext('2d');
    
        // Declare a base size of the font
        let fontSize = 70;
    
        do {
            // Assign the font to the context and decrement it so it can be measured again
            context.font = `${fontSize -= 10}px Arial`;
            // Compare pixel width of the text to the canvas minus the approximate avatar size
        } while (context.measureText(text).width > canvas.width - 300);
    
        // Return the result to use in the actual canvas
        return context.font;
    };
}
