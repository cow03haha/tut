const { getDatabase } = require('firebase-admin/database')
const db = getDatabase()

module.exports = {
    name: 'guildUpdate',
    async execute(oldGuild, newGuild) {
        if (oldGuild.name !== newGuild.name) {
            db.ref(`/guild/${newGuild.id}/name`).set(newGuild.name)
        }
    },
}
