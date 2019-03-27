const fs = require('fs')
const Discord = require('discord.js')
require('dotenv').config()
const prefix = '/'
const client = new Discord.Client()
client.commands = new Discord.Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

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
    if (!client.commands.has(commandName)) return
    let command = client.commands.get(commandName)

    try {
        command.execute(message, args)
    } catch (error) {
        console.error(error)
        message.reply('there was an error trying to execute that command!')
    }
})

client.login(process.env.BOT_TOKEN)
