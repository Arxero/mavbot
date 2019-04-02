const fs = require('fs')
const Discord = require('discord.js')
const Canvas = require('canvas')
const snekfetch = require('snekfetch')
require('dotenv').config()
const prefix = '/'
const client = new Discord.Client()
client.commands = new Discord.Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
const cooldowns = new Discord.Collection()

for (let file of commandFiles) {
    let command = require(`./commands/${file}`)
    client.commands.set(command.name, command)
}

client.once('ready', () => {
    console.log('Ready!')
})

// Pass the entire Canvas object because you'll need to access its width, as well its context
const applyText = (canvas, text) => {
	const ctx = canvas.getContext('2d');

	// Declare a base size of the font
	let fontSize = 70;

	do {
		// Assign the font to the context and decrement it so it can be measured again
		ctx.font = `${fontSize -= 10}px sans-serif`;
		// Compare pixel width of the text to the canvas minus the approximate avatar size
	} while (ctx.measureText(text).width > canvas.width - 300);

	// Return the result to use in the actual canvas
	return ctx.font;
};


//image manipulation part
client.on('guildMemberAdd', async member => {
    let channel = member.guild.channels.find(ch => ch.name == 'memes')
    if (!channel) return

    let canvas = Canvas.createCanvas(700, 250)
    let ctx = canvas.getContext('2d')
    let background = await Canvas.loadImage('./assets/images/wallpaper.jpg')

    //stretch the image background image
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height)
    
    //stroke
    ctx.strokeStyle = '#74037b'
    ctx.strokeRect(0, 0, canvas.width, canvas.height)

    // Slightly smaller text placed above the member's display name
	ctx.font = '28px sans-serif'
	ctx.fillStyle = '#ffffff'
	ctx.fillText('Welcome to the server,', canvas.width / 2.5, canvas.height / 2.6)


    ctx.font = applyText(canvas, `${member.displayName}!`)
    ctx.fillStyle = '#ffffff'
    ctx.fillText(member.displayName, canvas.width / 2.5, canvas.height / 1.5)

    ctx.beginPath()
    ctx.arc(125, 125, 100, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.clip()

    let {body: buffer} = await snekfetch.get(member.user.displayAvatarURL)
    let avatar = await Canvas.loadImage(buffer)
    ctx.drawImage(avatar, 25, 25, 200, 200)


    let attachment = new Discord.Attachment(canvas.toBuffer(), 'welcome-image.png')
    channel.send(attachment)

})
//image manipulation part

client.on('message', async message => {
    if (message.content === '/join') {
		client.emit('guildMemberAdd', message.member || await message.guild.fetchMember(message.author));
	}

    if (!message.content.startsWith(prefix)) return

    let args = message.content.slice(prefix.length).split(/ +/)
    let commandName = args.shift().toLowerCase()
    let command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

    if (!command) return

    if (command.guildOnly && message.channel.type !== 'text') {
        return message.reply('I can\'t execute that command inside DMs!')
    }

    if (command.args && !args.length) {
        let reply = `${message.author}, you didn't provide any arguments!`

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``
        }
        return message.channel.send(reply)
    }

    //cooldown implementation
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection())
    }

    let now = Date.now()
    let timestamps = cooldowns.get(command.name)
    let cooldownAmount = (command.cooldown || 3) * 1000

    if (timestamps.has(message.author.id)) {
        let expirationTime = timestamps.get(message.author.id) + cooldownAmount

        if (now < expirationTime) {
            let timeleft = (expirationTime - now) / 1000
            return message.reply(`please wait ${timeleft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`)
        }
    }

    timestamps.set(message.author.id, now)
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)
    //cooldown implementation

    try {
        command.execute(message, args)
    } catch (error) {
        console.error(error)
        message.reply('there was an error trying to execute that command!')
    }
})

client.login(process.env.BOT_TOKEN)
