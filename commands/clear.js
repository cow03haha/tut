const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('clear channel message')
        .setDefaultPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('after')
                .setDescription('clear channel message after message id you specific')
                .addStringOption(option =>
                    option
                        .setName('id')
                        .setDescription('message id of you specific')
                        .setRequired(true))),
    async execute(interaction) {
        const reply = await interaction.reply({ content: 'Deleting..', fetchReply: true })

        const channel = interaction.channel
        const target = await channel.messages.fetch(interaction.options.getString('id'))
        const messages = await channel.messages.fetch({ after: target.id, before: reply.id })

        const deletedMessages = await channel.bulkDelete(
            [...Array.from(messages.values()), target]
                .filter(msg => msg !== reply), true)
        await reply.edit(`Delete success!\nAmount: **${deletedMessages.size}**`)
        setTimeout(() => reply.delete(), 5000)
    },
}