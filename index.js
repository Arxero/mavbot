const Discord = require('discord.js')
// const config = require('./config.json')
const client = new Discord.Client()

client.once('ready', () => {
    console.log('Ready!')
})

client.on('message', message => {
    if (message.content == 'hey') {
        message.channel.send('well hello there')
    } else if (message.content.startsWith('/random')) {
        let str = message.content
        let fromTo = str.substr(7).trim().split('-')
        let maxNumber = Math.max(+fromTo[0], +fromTo[1])
        let minNumber = Math.min(+fromTo[0], +fromTo[1])
        let randomNumber = Math.floor((Math.random() * maxNumber) + minNumber)
        message.channel.send(randomNumber)
    }
})


// function solution() {
//     let str = '/random 1-100'
//     let fromTo = str.substr(7).trim().split('-')
//     let maxNumber = Math.max(+fromTo[0], +fromTo[1])
//     let minNumber = Math.min(+fromTo[0], +fromTo[1])
//     let randomNumber = Math.floor((Math.random() * maxNumber) + minNumber)
//     console.log(randomNumber)

// }
// solution()

client.login(process.env.BOT_TOKEN)