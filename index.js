const fs = require('fs')
const { Client, Collection, Intents } = require('discord.js')
const { token } = require('./config.json')
const admin = require('firebase-admin')
const serviceAccount = require('./serviceAccountKey.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://dcbot-tut-default-rtdb.firebaseio.com',
})

const client = new Client({ intents: new Intents(32767) })

client.commands = new Collection()
const commandFiles = fs
    .readdirSync('./commands')
    .filter((file) => file.endsWith('js'))

commandFiles.forEach((file) => {
    const command = require(`./commands/${file}`)
    client.commands.set(command.data.name, command)
})

const eventFiles = fs
    .readdirSync('./events')
    .filter((file) => file.endsWith('js'))

eventFiles.forEach((file) => {
    const event = require(`./events/${file}`)
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args))
    }
    else {
        client.on(event.name, (...args) => {
            try {
                event.execute(...args)
            }
            catch (error) {
                console.log(error)
            }
        })
    }
})

client.login(token)
