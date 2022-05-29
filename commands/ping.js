const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot latency'),
    async execute(interaction) {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true })
        const latency = sent.createdTimestamp - interaction.createdTimestamp
        interaction.editReply(`Roundtrip latency: ${latency}ms\nWebsocket heartbeat: ${interaction.client.ws.ping}ms.`)
    },
}