const fs = require('fs')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const { token2: token, clientId2: clientId, guildId } = require('./config.json')
const admin = require('firebase-admin')
const serviceAccount = require('./serviceAccountKey.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://dcbot-tut-default-rtdb.firebaseio.com',
})

const commands = []
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('js'))

commandFiles.forEach(file => {
    const command = require(`./commands/${file}`)
    commands.push(command.data.toJSON())
});

const rest = new REST({ version: '9' }).setToken(token)

for (const guild of guildId) {
    rest.put(Routes.applicationGuildCommands(clientId, guild), { body: commands })
        .then(() => console.log('Successfully registered application commands.'))
        .catch(console.error);
}