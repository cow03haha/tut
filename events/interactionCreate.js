module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isCommand()) {
            const command = interaction.client.commands.get(interaction.commandName)

            if (!command) return

            try {
                await command.execute(interaction)
            }
            catch (error) {
                console.log(error)
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
            }
        }
        else if (interaction.isModalSubmit()) {
            const command = interaction.client.commands.get('匿名')

            try {
                await command.send(interaction)
            }
            catch (error) {
                console.log(error)
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
            }
        }
    },
}