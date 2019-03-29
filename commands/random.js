module.exports = {
	name: 'random',
    description: 'Gives a random number in interval',
    args: true,
    usage: '<first number>-<second number>',
	execute(message, args) {
		args = args[0].split('-')
        let first = parseInt(args[0])
        let second = parseInt(args[1])

        if (isNaN(first)) {
            return message.reply('the first argument you provided doesn\'t seem to be valid number')
        } else if (isNaN(second)) {
            return message.reply('the second argument you provided doesn\'t seem to be valid number')
        } else if (first > second) {
            return message.reply('the first number must be smaller than the second')
        }

        message.channel.send(getRandomIntInclusive(first, second))
    
        function getRandomIntInclusive(min, max) {
            min = Math.ceil(min)
            max = Math.floor(max)
            return Math.floor(Math.random() * (max - min + 1)) + min
        }
    },
};