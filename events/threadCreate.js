const { talk, setTitle } = require('../utils/test.js')
const { getDatabase } = require('firebase-admin/database')
const db = getDatabase()

async function chatgpt(snapshot, thread, newly) {
    if (!newly || thread.parentId !== snapshot.child('forum_id').val()) return

    const waiting = await thread.send({ content: '等待回復...', fetchReply: true })
    const title = thread.name,
        msg = await thread.fetchStarterMessage()

    const [ last_msg, content, conversation_id ] = await talk('#zh-tw ' + msg.content)
    await setTitle(title, conversation_id)
    await snapshot.child(`talk/${thread.id}`).ref.set({
        conversation: conversation_id,
        last_msg: last_msg,
    })

    await waiting.edit({ content: content })
}

module.exports = {
    name: 'threadCreate',
    async execute(thread, newly) {
        const ref = db.ref(`/guild/${thread.guildId}/func`)
        const snapshot = await ref.once('value')

        if (snapshot.val().chatgpt.en) await chatgpt(snapshot.child('chatgpt/data'), thread, newly)
    },
}
