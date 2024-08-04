const { getDatabase } = require('firebase-admin/database')
const db = getDatabase()

module.exports = {
    name: 'inviteCreate',
    async execute(invite) {
        invite = await invite.guild.invites.fetch(invite.code)
        const ref = db.ref(`/guild/${invite.guild.id}/func`)
        await ref.child(`log/data/invite/${invite.code}`).ref.set({
            uses: 0,
            inviterId: invite.inviterId,
        })
    },
}
