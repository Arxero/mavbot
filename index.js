const fs = require('fs')
const Discord = require('discord.js')
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

client.on('message', message => {
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
