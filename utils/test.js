const { chatgpt } = require('../config.json')
const axios = require('axios')
const { wrapper } = require('axios-cookiejar-support')
const { CookieJar } = require('tough-cookie')

const jar = new CookieJar()
const client = wrapper(axios.create({ jar }))
client.defaults.baseURL = 'https://ai.fakeopen.com/'

function uuid4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        function(c) {
            const r = (Math.random() * 16) | 0,
                v = c === 'x' ? r : (r & 0x3) | 0x8
            return v.toString(16)
        },
    )
}

const token = chatgpt.access_token
const header = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + token,
    user_agent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
}

async function genTitle(id, conversation_id) {
    const url = `api/conversation/gen_title/${conversation_id}`
    const data = {
        model: 'text-davinci-002-render-sha',
        message_id: id,
    }

    const res = await client.post(url, data, {
        headers: header,
    })

    return res.data.title
}

async function setTitle(title, conversation_id) {
    const url = `api/conversation/${conversation_id}`
    const data = {
        title: title,
    }

    const res = await client.patch(url, data, {
        headers: header,
    })

    return res.data
}

async function delTalk(conversation_id) {
    const url = `api/conversation/${conversation_id}`
    const data = {
        is_visible: false,
    }

    const res = await client.patch(url, data, {
        headers: header,
    })

    return res.data
}

async function talk(msg, parent_msg = uuid4(), conversation = null) {
    const url = 'api/conversation'
    const data = {
        action: 'next',
        messages: [
            {
                id: uuid4(),
                role: 'user',
                author: {
                    role: 'user',
                },
                content: {
                    content_type: 'text',
                    parts: [msg],
                },
            },
        ],
        model: 'text-davinci-002-render-sha',
        parent_message_id: parent_msg,
        stream: false,
    }
    if (conversation) data.conversation_id = conversation

    const res = await client.post(url, data, {
        headers: header,
    })
    let payload = res.data.split('\n\n')
    payload = JSON.parse(payload[payload.length - 4].slice(6))

    return [
        payload.message.id,
        payload.message.content.parts[0],
        payload.conversation_id,
    ]
}

module.exports = { talk, genTitle, setTitle, delTalk }
