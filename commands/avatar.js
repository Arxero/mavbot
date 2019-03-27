module.exports = {
	name: 'avatar',
	description: 'Get the avatar URL of the tagged user(s), or your own avatar.',
	execute(message) {
		if (!message.mentions.users.size) {
            return message.channel.send(`Your avatar: ${message.author.displayAvatarURL}`)
        }

        let avatarList = message.mentions.users.map(user => {
            return message.channel.send(`${user.username}'s avatar is: ${user.displayAvatarURL}`)
        })

        // message.channel.send(avatarList)
	},
};