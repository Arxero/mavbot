module.exports = {
	name: 'prune',
    description: 'Prune up to 99 messages.',
    args: true,
    usage: 'number',
	execute(message, args) {
        let amount = parseInt(args[0]) + 1

        if (isNaN(amount)) {
            return message.reply('that doesn\'t seem to be a valid number.')
        } else if (amount < 2 || amount > 100) {
            return message.reply('you need to input a number between 1 and 99.')
        }
        
        if (message.author.id != '153158947581198337') {
            return message.reply('only Maverick can do that :)')
        }
        message.channel.bulkDelete(amount, true).catch(err => {
            console.error(err)
            message.channel.send('there was an error trying to prune messages in this channel!')
        })
	},
};