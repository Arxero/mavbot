const Discord = require('discord.js')
// const config = require('./config.json')
const prefix = '/'
const client = new Discord.Client()

client.once('ready', () => {
    console.log('Ready!')
})

client.on('message', message => {
    if (!message.content.startsWith(prefix)) {
        return
    }
    let args = message.content.slice(prefix.length).split(/ +/)
    let command = args.shift().toLowerCase()

    if (command == 'args-info') {
        if (!args.length) {
            return message.channel.send(`${message.author}, you didn't provide any arguments. `)
        } else if (args[0] == 'foo') {
            return message.channel.send('bar')
        }

        message.channel.send(`Command name: ${command}\nArguments: ${args}`)
        // message.channel.send(`First argument: ${args[0]}`)
    } else if (command == 'slap') {
        if (!message.mentions.users.size) {
            return message.reply('you need to tag a user in order to slap them!')
        }
        let taggedUser = message.mentions.users.first()
        message.channel.send(`You wanted to slap: ${taggedUser.username}`)
    } else if (command == 'avatar') {
        if (!message.mentions.users.size) {
            return message.channel.send(`Your avatar: ${message.author.displayAvatarURL}`)
        }
        let avatarList = message.mentions.users.map(user => {
            return message.channel.send(`${user.username}'s avatar is: ${user.displayAvatarURL}`)
        })
    } else if (command == 'prune') {
        let amount = parseInt(args[0]) + 1

        if (isNaN(amount)) {
            return message.reply('that doesn\'t seem to be a valid number.')
        } else if (amount < 2 || amount > 100) {
            return message.reply('you need to input a number between 1 and 99.')
        }
        message.channel.bulkDelete(amount, true).catch(err => {
            console.error(err)
            message.channel.send('there was an error trying to prune messages in this channel!')
        })
    } else if (command == 'random') {
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
    } else if (command == 'how' && args[0].toLowerCase() == 'gay') {
        args = args.filter(x => x != 'gay').filter(x => x != 'is')

        if (!args.length) {
            return message.reply('you didn\'t seem to give any name')
        }
        let usernameHowgay = args.join(' ')
        message.channel.send(`${usernameHowgay[0].charAt(0).toUpperCase() + usernameHowgay.slice(1)} is ${getRandomIntInclusive(1, 100)}% gay 👌`)
    } else if (command == 'hi' || command == 'hello') {
        return message.channel.send(`Greetings ${message.author.username}! 🙂\nhttps://giphy.com/gifs/hi-well-hello-there-whale-yoJC2A59OCZHs1LXvW`)
    }

    // if (message.content.toLowerCase().startsWith('hi') ||
    //     message.content.toLowerCase().startsWith('hey') ||
    //     message.content.toLowerCase().startsWith('hello') ||
    //     message.content.toLowerCase().startsWith('hellou')) {
    //     message.channel.send(`What is uuup ${message.author.username}? 🙂`)
    //     // message.channel.send('https://giphy.com/gifs/hi-well-hello-there-whale-yoJC2A59OCZHs1LXvW')
    // } else if (message.content.includes(`${prefix}random`)) {
    //     let userMessage = message.content
    //     let indexOfPrefix = userMessage.indexOf(prefix)
    //     userMessage = userMessage.substr(indexOfPrefix)
    //     let [first, second] = userMessage.substr(7).trim().split('-')
    //     let minNumber = Math.min(+first, +second)
    //     let maxNumber = Math.max(+first, +second)
    //     message.channel.send(getRandomIntInclusive(minNumber, maxNumber))
    // } else if (message.content.toLowerCase().includes(`${prefix}server info`)) {
    //     message.channel.send(`Server name: ${message.guild.name}\nTotal members: ${message.guild.memberCount}\nCreated at: ${message.guild.createdAt}\nRegion: ${message.guild.region}`)
    // }  else if (message.content.toLowerCase().includes(`${prefix}join date`)) {
    //     message.channel.send(`You joined this server on ${message.guild.joinedAt}`)
    // } else if (message.content.toLowerCase().startsWith('how gay is ')) {
    //     let userMessageHowGay = message.content.substr(10).trim().split(' ')
    //     let usernameHowgay = userMessageHowGay[0].charAt(0).toUpperCase() + userMessageHowGay[0].slice(1)
    //     // let maxNumberHowGay = +userMessageHowGay[2]
    //     message.channel.send(`${usernameHowgay} is ${getRandomIntInclusive(1, 100)}% gay 👌`) 
    // }

})


function getRandomIntInclusive(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
}

// function getRandomIntInclusive() {
//     let str = 'give me /random 99-100'
//     let indexOfPrefix = str.indexOf(prefix)
//     str = str.substr(indexOfPrefix)
//     let [first, second] = str.substr(7).trim().split('-')
//     let maxNumber = Math.max(+first, +second)
//     let minNumber = Math.min(+first, +second)
//     let randomNumber = Math.floor((Math.random() * maxNumber) + minNumber)
//     console.log(randomNumber)
//     // console.log(randomNumber)

// }




client.login(process.env.BOT_TOKEN)
// client.login(config.token)