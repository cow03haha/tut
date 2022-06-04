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
            }
        }
        else if (interaction.isButton()) {
            if (interaction.customId.startsWith('anoymous')) {
                const command = interaction.client.commands.get('匿名')

                try {
                    await command.check(interaction)
                }
                catch (error) {
                    console.log(error)
                }
            }
        }
        else if (interaction.isSelectMenu()) {
            await interaction.deferUpdate()
        }
        else if (interaction.isModalSubmit()) {
            if (interaction.customId === 'anoymous') {
                const command = interaction.client.commands.get('匿名')

                try {
                    await command.send(interaction)
                }
                catch (error) {
                    console.log(error)
                }
            }
        }
    },
}