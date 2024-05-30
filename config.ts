/* eslint-disable @typescript-eslint/explicit-function-return-type */
export default () => ({
	port: parseInt(process.env.PORT!, 10) || 3000,

	db: {
		host: process.env.DB_HOST,
		port: parseInt(process.env.DB_PORT!, 10) || 3306,
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE,
	},

	bot: {
		token: process.env.BOT_TOKEN,
		appId: process.env.APPLICATION_ID,
		serverId: process.env.SERVER_ID,
		acConfig: process.env.AC_CONFIG,
	},
});
