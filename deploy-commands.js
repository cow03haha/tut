const fs = require('fs')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const { token2 } = require('./config.json')

const clientId = '969128799004409916'
const guildId = ['620185843822231572', '843781893828378645']
const commands = []
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('js'))

commandFiles.forEach(file => {
    const command = require(`./commands/${file}`)
    commands.push(command.data.toJSON())
});

const rest = new REST({ version: '9' }).setToken(token2)

for (const guild of guildId) {
    rest.put(Routes.applicationGuildCommands(clientId, guild), { body: commands })
        .then(() => console.log('Successfully registered application commands.'))
        .catch(console.error);
}