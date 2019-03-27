module.exports = {
	name: 'hi',
	description: 'says hi to the user',
	execute(message, args) {
        return message.channel.send(`Greetings ${message.author.username}! 🙂\nhttps://giphy.com/gifs/hi-well-hello-there-whale-yoJC2A59OCZHs1LXvW`)
	},
};