const Discord = require('discord.js');

module.exports = {
    name: 'hi',
    description: 'says hi to the user',
    cooldown: 10,
    execute(message, args) {
        let file = new Discord.Attachment('./assets/images/whale_hello_there.gif')
        let howCommandEmbed = {
            color: 0x0B8FD7,
            title: `Greetings ${message.author.username}! 🙂`,
            image: {
                url: 'attachment://whale_hello_there.gif',
            },
        }

        message.react('👋')
        return message.channel.send({ embed: howCommandEmbed, files: [file] })
    },
};