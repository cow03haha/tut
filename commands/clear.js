const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('clear channel message that are newer than two week')
        .setDefaultPermission(false)
        .addSubcommand((subcommand) =>
            subcommand
                .setName('amount')
                .setDescription(
                    'clear specific amount of messages',
                )
                .addIntegerOption((option) =>
                    option
                        .setName('nums')
                        .setDescription('number of messages you want clear(limit: 100)')
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('all')
                .setDescription('clear all message that are newer then two week in channel'),
        ),
    async execute(interaction) {
        await interaction.reply('Deleting..., this may take some time')

        const ch = interaction.channel
        let total = 0
        if (interaction.options.getSubcommand() === 'all') {
            while (true) {
                const deleted = await ch.bulkDelete(100)
                total += deleted.size
                if (deleted.size < 100) break
            }
        }
        else {
            const deleted = await ch.bulkDelete(interaction.options.getInteger('nums') + 1)
            total += deleted.size
        }

        const reply = await ch.send({
            content: `Delete success!\nAmount: **${total - 1}**`,
            fetchReply: true,
        })
        setTimeout(() => reply.delete(), 5000)
    },
}
