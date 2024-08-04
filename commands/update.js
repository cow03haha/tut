const { SlashCommandBuilder } = require('@discordjs/builders')
const { getDatabase } = require('firebase-admin/database')
const db = getDatabase()

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('manual update')
        .setDefaultPermission(false),
    async execute(interaction) {
        const reply = await interaction.reply({ content: 'updateing...', fetchReply: true })

        let count = 0
        for (const [, guild] of interaction.client.guilds.cache) {
            const ref = db.ref(`/guild/${guild.id}/func/log/data/invite`)
            const invite = {}
            for (const [, v] of await guild.invites.fetch()) {
                console.log(v.code)
                invite[v.code] = {
                    uses: v.uses,
                    inviterId: v.inviterId,
                }
            }
            await ref.set(invite)
            count++
        }

        await reply.edit(`update **${count}** guild success`)
    },
}