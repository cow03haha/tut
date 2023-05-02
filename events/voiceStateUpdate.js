const { MessageEmbed, Formatters } = require('discord.js')
const { getDatabase } = require('firebase-admin/database')
const db = getDatabase()

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

    if (newState.channelId === snapshot.child('entry').val()) {
        const channel = await newState.channel.parent.createChannel(
            newState.member.displayName,
            {
                type: 'GUILD_VOICE',
                permissionOverwrites: [
                    {
                        id: newState.channel.guild.roles.everyone,
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

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        const ref = db.ref(`/guild/${newState.guild.id}/func`)
        const snapshot = await ref.once('value')
        if (snapshot.val().log.en) log(snapshot.child('log/data'), oldState, newState)
        if (snapshot.val().dynamic_voice.en) {
            await dynamic_voice(
                snapshot.child('dynamic_voice/data'),
                oldState,
                newState,
            )
        }
    },
}
