const { SlashCommandBuilder } = require('@discordjs/builders')
const { getDatabase } = require('firebase-admin/database')
const db = getDatabase()

module.exports = {
    data: new SlashCommandBuilder()
        .setName('db_init')
        .setDescription('Init database')
        .setDefaultPermission(false),
    async execute(interaction) {
        const guild = await interaction.guild
        const struct = {
            func: {
                anoymous: {
                    data: {
                        check_ch: '1',
                        post_ch: '2',
                    },
                    en: false,
                },
                dynamic_voice: {
                    data: {
                        queue: {},
                        entry: '12345',
                    },
                    en: false,
                },
                log: {
                    data: {
                        channel: {
                            default: '1',
                            member: '2',
                            voice: '3',
                        },
                        invite: {},
                    },
                    en: false,
                },
            },
        }
        await db.ref(`/guild/${guild.id}`).update(struct)

        await interaction.reply({
            content: `**${guild.name}** database init success`,
            ephemeral: false,
        })
    },
}
