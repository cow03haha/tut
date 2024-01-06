const { MessageEmbed, Formatters } = require('discord.js')
const { getDatabase } = require('firebase-admin/database')
const db = getDatabase()

const count = {}
async function clear_interval(client, guildId) {
    count[guildId].during++
    if (count[guildId].during >= 3600) {
        const guild = await client.guilds.fetch(guildId)
        const ch = await guild.channels.fetch(count[guildId].ch)

        while (true) {
            const deleted = await ch.bulkDelete(100)
            if (deleted.size < 100) break
        }
        clearInterval(count[guildId].interval)
        delete count[guildId]
    }
}

async function auto_clear(snapshot, oldState, newState) {
    const guild = newState.guild
    const voiceStates = guild.voiceStates.cache

    if (voiceStates.every(voice => voice.channelId === null)) {
        count[guild.id] = {
            ch: snapshot.child('ch').val(),
            interval: null,
            during: 0,
        }
        const interval = setInterval(clear_interval, 1000, newState.client, guild.id)
        count[guild.id].interval = interval
    }
    else if (voiceStates.size && count[guild.id]) {
        clearInterval(count[guild.id].interval)
        delete count[guild.id]
    }
}

async function log(snapshot, oldState, newState) {
    let ch = snapshot.child('channel').val()
    ch = await newState.guild.channels.fetch(ch.voice ? ch.voice : ch.default)
    const embed = (color, msg) => new MessageEmbed()
        .setAuthor({ name: newState.member.user.tag, iconURL: newState.member.displayAvatarURL() })
        .setColor(color)
        .setDescription(msg)
        .setTimestamp(Date.now())

    let status = null
    if (!oldState.channel && newState.channel) status = embed('GREEN', `${newState.member} joined voice channel ${Formatters.channelMention(newState.channelId)}`)
    else if (oldState.channel && !newState.channel) status = embed('RED', `${newState.member} left voice channel ${Formatters.channelMention(oldState.channelId)}`)
    else if (oldState.channel != newState.channel) status = embed('BLUE', `${newState.member} switched voice channel ${Formatters.channelMention(oldState.channelId)} -> ${Formatters.channelMention(newState.channelId)}`)

    if (status) await ch.send({ embeds: [status] })
}

async function dynamic_voice(snapshot, oldState, newState) {
    const queue = snapshot.child('queue').val()

    if (oldState.channel) {
        if (Object.keys(queue ? queue : {}).includes(oldState.channelId)) {
            if (!oldState.channel.members.size) {
                try {
                    await oldState.channel.delete('auto voice')
                }
                catch (error) {
                    // pass
                }
                await snapshot.child(`queue/${oldState.channelId}`).ref.remove()
            }
        }
    }

    if (newState.channelId === snapshot.child('entry').val()) {
        const channel = await newState.channel.parent.createChannel(
            newState.member.displayName,
            {
                type: 'GUILD_VOICE',
                permissionOverwrites: [
                    {
                        id: newState.guild.roles.everyone,
                        allow: 'VIEW_CHANNEL',
                        type: 'role',
                    },
                    {
                        id: newState.member,
                        allow: [
                            'VIEW_CHANNEL',
                            'MANAGE_CHANNELS',
                            'MANAGE_ROLES',
                        ],
                        type: 'user',
                    },
                ],
                parent: newState.channel.parent,
                reason: 'auto voice',
            },
        )

        await newState.setChannel(channel, 'auto voice')
        await snapshot.child(`queue/${channel.id}`).ref.set(true)
    }
}

async function tomb(snapshot, oldState, newState) {
    const entry = await oldState.guild.channels.fetch(snapshot.child('entry').val())
    const queue = await snapshot.child('queue').val()

    if (oldState.channel) {
        if (Object.keys(queue ? queue : {}).includes(oldState.channelId)) {
            if (!oldState.channel.members.size) {
                try {
                    await oldState.channel.delete('auto voice')
                }
                catch (error) {
                    // pass
                }
                await snapshot.child(`queue/${oldState.channelId}`).ref.remove()
                await entry.edit({
                    permissionOverwrites: [
                        {
                            id: newState.guild.roles.everyone,
                            allow: 'VIEW_CHANNEL',
                            type: 'role',
                        },
                    ],
                }, 'fun')
            }
        }
    }

    if (newState.channel === entry) {
        const ch = await newState.channel.parent.createChannel(
            `✝${newState.member.displayName}✝`,
            {
                type: 'GUILD_VOICE',
                userLimit: 1,
                parent: newState.channel.parent,
                position: entry.position + 1,
                reason: 'fun',
            },
        )

        await newState.setChannel(ch, 'fun')
        await entry.edit({
            permissionOverwrites: [
                {
                    id: newState.guild.roles.everyone,
                    deny: 'VIEW_CHANNEL',
                    type: 'role',
                },
            ],
        }, 'fun')
        await snapshot.child(`queue/${ch.id}`).ref.set(true)
    }
}

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        const ref = db.ref(`/guild/${newState.guild.id}/func`)
        const snapshot = await ref.once('value')
        if (snapshot.val().auto_clear.en) await auto_clear(snapshot.child('auto_clear/data'), oldState, newState)
        if (snapshot.val().log.en) await log(snapshot.child('log/data'), oldState, newState)
        if (snapshot.val().dynamic_voice.en) await dynamic_voice(snapshot.child('dynamic_voice/data'), oldState, newState)
        if (snapshot.val().fun.tomb.en) await tomb(snapshot.child('fun/tomb/data'), oldState, newState)
    },
}
