module.exports = {
	name: 'ping',
    description: 'Ping!',
    cooldown: 5,
	execute(message, args) {
        // const exampleEmbed = new Discord.RichEmbed()
        // .setTitle('Some title')
        // .attachFiles(['https://cdn.discordapp.com/avatars/153158947581198337/c4b215b356b1d6b023cd6750042a10f8.png?size=2048'])
        // .setImage('attachment:https://cdn.discordapp.com/avatars/153158947581198337/c4b215b356b1d6b023cd6750042a10f8.png?size=2048')

        const exampleEmbed = {
            color: 0x0B8FD7,
            title: 'Pong.',
        }
        
        message.channel.send({ embed: exampleEmbed });

        // if (message.author.bot) {
        //     exampleEmbed.setColor('#7289da')
        // }


		// message.channel.send('Pong.');
	},
};