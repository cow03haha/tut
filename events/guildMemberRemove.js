const { getDatabase } = require('firebase-admin/database')
const { MessageEmbed, Formatters } = require('discord.js')
const db = getDatabase()

async function log(snapshot, member) {
    const embed = new MessageEmbed()
        .setColor('RED')
        .setTitle('Member Left')
        .setThumbnail(member.displayAvatarURL())
        .setDescription(`${Formatters.userMention(member.id)} ${member.user.username}#${member.user.discriminator}`)
        .setTimestamp(Date.now())
    let ch = snapshot.child('channel').val()
    ch = await member.guild.channels.fetch(ch.member ? ch.member : ch.default)
    await ch.send({ embeds:[embed] })
}

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        const ref = db.ref(`/guild/${member.guild.id}/func`)
        const snapshot = await ref.once('value')
        if (snapshot.val().log.en) log(snapshot.child('log/data'), member)
    },
}
