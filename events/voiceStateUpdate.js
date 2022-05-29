const dynmaic = []

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        const entry = await newState.guild.channels.fetch('977272062244696094')
        const parent = entry.parent

        if (dynmaic.includes(oldState.channelId)) {
            try {
                const channel = await oldState.channel.fetch()
                if (!channel.members.size) {
                    await oldState.channel.delete('auto voice')
                    dynmaic.splice(dynmaic.indexOf(oldState.channelId), 1)
                }
            }
            catch (error) {
                // pass
            }
        }

        if (newState.channel === entry) {
            const channel = await parent.createChannel(newState.member.displayName, {
                type: 'GUILD_VOICE',
                permissionOverwrites: [
                    {
                        id: entry.guild.roles.everyone,
                        deny: 'VIEW_CHANNEL',
                        type: 'role',
                    },
                    {
                        id: newState.member,
                        allow: ['VIEW_CHANNEL', 'MANAGE_CHANNELS', 'MANAGE_ROLES'],
                        type: 'user',
                    },
                ],
                parent: parent,
                reason: 'auto voice',
            })
            dynmaic.push(channel.id)

            await newState.setChannel(channel, 'auto voice')
        }
    },
}