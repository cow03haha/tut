const { getDatabase } = require('firebase-admin/database')
const { MessageEmbed, Formatters } = require('discord.js')
const db = getDatabase()

async function log(snapshot, member) {
    const before = snapshot.child('invite').val()
    const now = await member.guild.invites.fetch()
    let inviteBy = null
    for (const i of now.values()) {
        if (i.uses > before[i.code]) {
            inviteBy = i
            break;
        }
    }

    const embed = new MessageEmbed()
        .setColor('GREEN')
        .setTitle('Member joined')
        .setThumbnail(member.displayAvatarURL())
        .setDescription(`${Formatters.userMention(member.id)} ${member.user.username}#${member.user.discriminator}`)
        .addFields([
            {
                name: 'invite by',
                value: `${inviteBy ? Formatters.userMention(inviteBy.inviterId) : '???'}`,
            },
            {
                name: 'invite code',
                value: `${inviteBy ? inviteBy.code : '???'}`,
            },
        ])
        .setTimestamp(member.joinedAt)
    let ch = snapshot.child('channel').val()
    ch = await member.guild.channels.fetch(ch.member ? ch.member : ch.default)
    await ch.send({ embeds:[embed] })
    if (inviteBy) await snapshot.child(`invite/${inviteBy.code}`).ref.set(inviteBy.uses)
}

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const ref = db.ref(`/guild/${member.guild.id}/func`)
        const snapshot = await ref.once('value')
        if (snapshot.val().log.en) log(snapshot.child('log/data'), member)
    },
}
