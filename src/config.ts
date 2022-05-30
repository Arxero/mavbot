import { Intents } from 'discord.js';

interface Config {
    intents: number[],
    token?: string,
    clientId?: string,
    guildId?: string
}

export const config: Config = {
    intents: [Intents.FLAGS.GUILDS],
    token: process.env.BOT_TOKEN,
    clientId: process.env.APPLICATION_ID,
    guildId: process.env.SERVER_ID,
};
