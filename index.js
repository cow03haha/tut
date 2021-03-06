const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js')
const { token2 } = require('./config.json')

const client = new Client({ intents: new Intents(32767) })

client.commands = new Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('js'))

commandFiles.forEach(file => {
    const command = require(`./commands/${file}`)
    client.commands.set(command.data.name, command)
});

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('js'))

eventFiles.forEach(file => {
    const event = require(`./events/${file}`)
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args))
    }
    else {
        client.on(event.name, (...args) => event.execute(...args))
    }
})

client.login(token2)