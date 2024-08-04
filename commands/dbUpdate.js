const { SlashCommandBuilder } = require('@discordjs/builders')
const { getDatabase } = require('firebase-admin/database')
const db = getDatabase()

function mergeObjects(target, source) {
    for (const key in source) {
        if (Object.hasOwnProperty.call(source, key)) {
            if (
                typeof source[key] === 'object' &&
                source[key] !== null &&
                !Array.isArray(source[key])
            ) {
                if (!Object.hasOwnProperty.call(target, key)) {
                    target[key] = {}
                }
                mergeObjects(target[key], source[key])
            }
            else if (!Object.hasOwnProperty.call(target, key)) {
                target[key] = source[key]
            }
        }
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('db_update')
        .setDescription('update database')
        .setDefaultPermission(false),
    async execute(interaction) {
        const struct = {
            func: {
                anoymous: {
                    data: {
                        check_ch: 'id',
                        post_ch: 'id',
                    },
                    en: false,
                },
                dynamic_voice: {
                    data: {
                        queue: {
                            // id: true
                        },
                        entry: 'id',
                    },
                    en: false,
                },
                log: {
                    data: {
                        channel: {
                            default: 'id',
                            member: false,
                            voice: false,
                        },
                        invite: {
                            // invite_code: {
                            //     uses: int,
                            //     inviterId: str,
                            // }
                        },
                    },
                    en: false,
                },
                chatgpt: {
                    data: {
                        forum_id: 'id',
                        talk: {
                            // post_id: { conversation: 'uuid4', last_msg: 'uuid4'}
                        },
                    },
                    en: false,
                },
                keyword: {
                    data: {
                        list: {
                            hi: '早安',
                        },
                    },
                    en: false,
                },
                auto_clear: {
                    data: {
                        ch: 'id',
                    },
                    en: false,
                },
                fun: {
                    tomb: {
                        data: {
                            queue: {
                                // id: true
                            },
                            entry: 'id',
                        },
                        en: false,
                    },
                },
            },
        }

        let total = 0
        for (const [guildId] of interaction.client.guilds.cache) {
            const snapshot = await db.ref(`/guild/${guildId}`).once('value')
            const data = snapshot.val() ? snapshot.val() : {}

            mergeObjects(data, struct)
            await db.ref(`/guild/${guildId}`).update(data)
            total++
        }

        await interaction.reply({
            content: `**${total}** guild database update success`,
            ephemeral: false,
        })
    },
}
