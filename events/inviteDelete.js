const { getDatabase } = require('firebase-admin/database')
const db = getDatabase()

module.exports = {
    name: 'inviteDelete',
    async execute(invite) {
        const ref = db.ref(`/guild/${invite.guild.id}/func`)
        await new Promise(r => setTimeout(r, 5000))
        await ref.child(`log/data/invite/${invite.code}`).ref.remove()
    },
}
