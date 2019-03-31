module.exports = {
	name: 'how',
    description: 'tells how gay is the person',
    args: true,
    usage: '<adjective> is <name>',
	execute(message, args) {
        let adjective = args[0]
        args = args.slice(1).filter(x => x != 'is')

        if (!args.length) {
            return message.reply('you didn\'t seem to give any name')
        }

        let usernameHowgay = args.join(' ')
        let howCommandEmbed = {
            color: 0x0B8FD7,
            description: `${usernameHowgay[0].charAt(0).toUpperCase() + usernameHowgay.slice(1)} is ${getRandomIntInclusive(1, 100)}% ${adjective} 👌`
        }
        
        message.channel.send({ embed: howCommandEmbed });

        function getRandomIntInclusive(min, max) {
            min = Math.ceil(min)
            max = Math.floor(max)
            return Math.floor(Math.random() * (max - min + 1)) + min
        }
    },
    
};