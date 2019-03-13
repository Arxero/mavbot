const Discord = require('discord.js')
// const config = require('./config.json')
const prefix = '/'
const client = new Discord.Client()

client.once('ready', () => {
    console.log('Ready!')
})

client.on('message', message => {
    if (message.content.toLowerCase().startsWith('hi') ||
        message.content.toLowerCase().startsWith('hey') ||
        message.content.toLowerCase().startsWith('hello') ||
        message.content.toLowerCase().startsWith('hellou')) {
        message.channel.send(`What is uuup ${message.author.username}? 🙂`)
        // message.channel.send('https://giphy.com/gifs/hi-well-hello-there-whale-yoJC2A59OCZHs1LXvW')
    } else if (message.content.includes(`${prefix}random`)) {
        let userMessage = message.content
        let indexOfPrefix = userMessage.indexOf(prefix)
        userMessage = userMessage.substr(indexOfPrefix)
        let [first, second] = userMessage.substr(7).trim().split('-')
        let minNumber = Math.min(+first, +second)
        let maxNumber = Math.max(+first, +second)
        message.channel.send(getRandomIntInclusive(minNumber, maxNumber))
    } else if (message.content.toLowerCase().includes(`${prefix}server info`)) {
        message.channel.send(`Server name: ${message.guild.name}\nTotal members: ${message.guild.memberCount}\nCreated at: ${message.guild.createdAt}\nRegion: ${message.guild.region}`)
    }  else if (message.content.toLowerCase().includes(`${prefix}join date`)) {
        message.channel.send(`You joined this server on ${message.guild.joinedAt}`)
    } else if (message.content.toLowerCase().startsWith('how gay is ')) {
        let userMessageHowGay = message.content.substr(10).trim().split(' ')
        let usernameHowgay = userMessageHowGay[0].charAt(0).toUpperCase() + userMessageHowGay[0].slice(1)
        // let maxNumberHowGay = +userMessageHowGay[2]
        message.channel.send(`${usernameHowgay} is ${getRandomIntInclusive(1, 100)} gay 👌`) 
    }
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
getRandomIntInclusive()



client.login(process.env.BOT_TOKEN)
// client.login(config.token)