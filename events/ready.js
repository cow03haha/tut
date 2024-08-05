const { getDatabase } = require('firebase-admin/database')
const db = getDatabase()

async function dynamic_voice(guild, snapshot) {
    const entry = await guild.channels.fetch(snapshot.child('entry').val())
    const queue = snapshot.child('queue').val()

    for (const i of Object.keys(queue || {})) {
        if (guild.available) {
            const ch = await guild.channels.fetch(i)
            if (!ch.members.size) {
                await guild.channels.delete(i, 'auto voice')
                await snapshot.child(`queue/${i}`).ref.remove()
            }
        }
    }

    if (entry.members.size) {
        const ch = await guild.channels.create(
            entry.members.at(0).displayName,
            {
                type: 'GUILD_VOICE',
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone,
                        allow: 'VIEW_CHANNEL',
                        type: 'role',
                    },
                    {
                        id: entry.members.at(0),
                        allow: [
                            'VIEW_CHANNEL',
                            'MANAGE_CHANNELS',
                            'MANAGE_ROLES',
                        ],
                        type: 'user',
                    },
                ],
                parent: entry.parent,
                reason: 'auto voice',
            },
        )
        await snapshot.child(`queue/${ch.id}`).ref.set(true)

        for (const [, i] of entry.members) {
            await i.voice.setChannel(ch)
        }
    }
}

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`)
        console.log('Initial...\n')
        const guilds = client.guilds.cache

        for (const [id, guild] of guilds) {
            const snapshot = await db.ref(`/guild/${id}`).once('value')

            console.log(`${guild.name}:`)
            if (snapshot.child('func/dynamic_voice/en').val()) {
                console.log('reset dynamic_voice')
                await dynamic_voice(guild, snapshot.child('func/dynamic_voice/data'))
            }
            await db.ref(`/cache/${id}`).remove()
            console.log('===========================')
        }
        console.log('\ndone!')
    },
}