module.exports = {
	name: 'how',
	description: 'tells how gay is the person',
	execute(message, args) {
        args = args.filter(x => x != 'gay').filter(x => x != 'is')

        if (!args.length) {
            return message.reply('you didn\'t seem to give any name')
        }
        let usernameHowgay = args.join(' ')
        message.channel.send(`${usernameHowgay[0].charAt(0).toUpperCase() + usernameHowgay.slice(1)} is ${getRandomIntInclusive(1, 100)}% gay 👌`)
    
        function getRandomIntInclusive(min, max) {
            min = Math.ceil(min)
            max = Math.floor(max)
            return Math.floor(Math.random() * (max - min + 1)) + min
        }
    },
    
};