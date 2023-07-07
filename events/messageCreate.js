const { talk, delTalk } = require('../utils/test.js')
const { getDatabase } = require('firebase-admin/database')
const db = getDatabase()

async function keyword(snapshot, message) {
    const list = snapshot.child('list').val()
    if (message.channel.type !== 'GUILD_TEXT') return
    if (!list[message.content]) return

    const channel = message.channel
    await channel.send(list[message.content])
}

async function chatgpt(snapshot, message) {
    const ch = message.channel
    const start_check = async () => {
        const msgs = await ch.messages.fetch()
        return msgs.size === 1
    }
    if (!ch.isThread()) return
    if (ch.parentId !== snapshot.child('forum_id').val()) return
    if (await start_check()) return

    if (message.content === 'close' && message.author.id === ch.ownerId) {
        await delTalk(snapshot.child(`talk/${ch.id}`).val().conversation)
        await snapshot.child(`talk/${ch.id}`).ref.remove()
        await await ch.delete('chatgpt: talk end')
        return
    }

    const waiting = await ch.send({ content: '等待回復...', fetchReply: true })

    const [ last_msg, content ] = await talk(
        message.content,
        snapshot.child(`talk/${ch.id}/last_msg`).val(),
        snapshot.child(`talk/${ch.id}/conversation`).val(),
    )
    await snapshot.child(`talk/${ch.id}/last_msg`).ref.set(last_msg)

    await waiting.edit({ content: content })
}

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) return

        const ref = db.ref(`/guild/${message.guildId}/func`)
        const snapshot = await ref.once('value')

        if (snapshot.val().keyword.en) await keyword(snapshot.child('keyword/data'), message)
        if (snapshot.val().chatgpt.en) await chatgpt(snapshot.child('chatgpt/data'), message)
    },
}
