import { ColorResolvable, Intents } from 'discord.js';
import { Type } from 'gamedig';

interface IConfig {
	intents: number[];
	token?: string;
	clientId?: string;
	guildId?: string;

    gameType: Type,
    host: string,
    port?: number,
    maxAttempts?: number,

    embedColor: ColorResolvable,
    embedIP?: string,
    emdbedIconUrl?: string;
    embedFile: string;
}

export const config: IConfig = {
	intents: [Intents.FLAGS.GUILDS],
	token: process.env.BOT_TOKEN,
	clientId: process.env.APPLICATION_ID,
	guildId: process.env.SERVER_ID,

    gameType: 'cs16',
    host: 'ac.gamewaver.com',
    port: 27017,
    maxAttempts: 3,

    embedColor: '#0EF04E',
    embedIP: '130.204.202.133:27017',
    emdbedIconUrl: 'https://i.imgur.com/7Bh5QSs.png',
    embedFile: 'https://www.game-state.com/130.204.202.133:27017/n-560x95_0EF04E_FFFFFF_000000_000000.png',
};
