module.exports = {
	name: 'say',
	description: 'Impersonating the bot',
	execute(message, args) {
        message.delete(1)
        message.channel.send(args.join(' '))
	},
};