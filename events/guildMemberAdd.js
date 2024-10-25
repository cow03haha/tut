const { getDatabase } = require('firebase-admin/database')
const { MessageEmbed, Formatters } = require('discord.js')
const db = getDatabase()

async function log(snapshot, member) {
    if (member.user.bot) return
    const before = snapshot.child('invite').val()
    const now = await member.guild.invites.fetch()
    // console.dir(now)
    let inviteBy = null
    for (const [code, i] of Object.entries(before)) {
        if (now.get(code) === undefined) {
            if (i.expires !== null && i.expires < Date.now()) {
                await snapshot.child(`invite/${code}`).ref.remove()
                continue
            }

            inviteBy = {
                code: code,
                ...i,
            }
            await snapshot.child(`invite/${inviteBy.code}`).ref.remove()
            break
        }
        else if (i.uses < now.get(code).uses) {
            inviteBy = now.get(code)
            await snapshot.child(`invite/${inviteBy.code}/uses`).ref.set(inviteBy.uses)
            break
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
                value: `${inviteBy ? Formatters.userMention(inviteBy.inviterId) : '(???)'}`,
            },
            {
                name: 'invite code',
                value: `${inviteBy ? inviteBy.code : '(???)'}`,
            },
        ])
        .setTimestamp(member.joinedAt)
    let ch = snapshot.child('channel').val()
    ch = await member.guild.channels.fetch(ch.member ? ch.member : ch.default)
    await ch.send({ embeds:[embed] })
}

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const ref = db.ref(`/guild/${member.guild.id}/func`)
        const snapshot = await ref.once('value')
        if (snapshot.val().log.en) log(snapshot.child('log/data'), member)
    },
}
