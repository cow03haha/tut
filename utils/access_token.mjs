import { readFile, writeFile } from 'fs/promises'
const config = JSON.parse(
    await readFile(new URL('../config.json', import.meta.url)),
)
import url from 'node:url'
import axios from 'axios'
import { wrapper } from 'axios-cookiejar-support'
import { CookieJar } from 'tough-cookie'
import { URL } from 'url'

const jar = new CookieJar()
const client = wrapper(axios.create({ jar }))

const email = config.chatgpt.email
const pass = config.chatgpt.pass
const code_challenge = 'w6n3Ix420Xhhu-Q5-mOOEyuPZmAsJHUbBpO8Ub7xBCY'
const code_verifier = 'yGrXROHx_VazA0uovsxKfE263LMFcrSrdm4SlC-rob8'
const user_agent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'

async function auth0() {
    const _url = `https://auth0.openai.com/authorize?client_id=pdlLIX2Y72MIl2rhLhTE9VV9bN905kBh&audience=https%3A%2F%2Fapi.openai.com%2Fv1&redirect_uri=com.openai.chat%3A%2F%2Fauth0.openai.com%2Fios%2Fcom.openai.chat%2Fcallback&scope=openid%20email%20profile%20offline_access%20model.request%20model.read%20organization.read%20offline&response_type=code&code_challenge=${code_challenge}&code_challenge_method=S256&prompt=login`
    const headers = {
        'User-Agent': user_agent,
        Referer: 'https://ios.chat.openai.com/',
    }

    const res = await client.get(_url, {
        headers: headers,
    })
    const url_params = new URL(res.request.res.responseUrl).searchParams

    return auth1(url_params.get('state'))
}

async function auth1(state) {
    const _url = 'https://auth0.openai.com/u/login/identifier?state=' + state
    const headers = {
        'User-Agent': user_agent,
        Referer: _url,
        Origin: 'https://auth0.openai.com',
    }
    const data = {
        state: state,
        username: email,
        'js-available': 'true',
        'webauthn-available': 'true',
        'is-brave': 'false',
        'webauthn-platform-available': 'false',
        action: 'default',
    }

    const res = await client.post(_url, data, {
        headers: headers,
    })

    return auth2(state)
}

async function auth2(state) {
    const _url = 'https://auth0.openai.com/u/login/password?state=' + state
    const headers = {
        'User-Agent': user_agent,
        Referer: _url,
        Origin: 'https://auth0.openai.com',
    }
    const data = {
        state: state,
        username: email,
        password: pass,
        action: 'default',
    }

    const res = await client.post(_url, data, {
        headers: headers,
        maxRedirects: 0,
        validateStatus: (status) => status === 302 || status === 200,
    })

    return auth3(res.headers['location'], _url)
}

async function auth3(location, ref) {
    const _url = 'https://auth0.openai.com' + location
    const headers = {
        'User-Agent': user_agent,
        Referer: ref,
    }

    const res = await client.get(_url, {
        headers: headers,
        maxRedirects: 0,
        validateStatus: (status) => status === 302 || status === 200,
    })

    return auth4(res.headers['location'])
}

async function auth4(callback_url) {
    const url_params = new URL(callback_url).searchParams
    const _url = 'https://auth0.openai.com/oauth/token'
    const headers = {
        'User-Agent': user_agent,
    }
    const data = {
        redirect_uri:
            'com.openai.chat://auth0.openai.com/ios/com.openai.chat/callback',
        grant_type: 'authorization_code',
        client_id: 'pdlLIX2Y72MIl2rhLhTE9VV9bN905kBh',
        code: url_params.get('code'),
        code_verifier: code_verifier,
    }

    const res = await client.post(_url, data, {
        headers: headers,
    })

    config.chatgpt.access_token = res.data.access_token
    config.chatgpt.refresh_token = res.data.refresh_token
    try {
        await writeFile(
            new URL('../config.json', import.meta.url),
            JSON.stringify(config, null, 4),
        )
        return res.data
    } catch (error) {
        throw error
    }
}

async function refresh(token) {
    const _url = 'https://auth0.openai.com/oauth/token'
    const headers = {
        'User-Agent': user_agent,
    }
    const data = {
        redirect_uri:
            'com.openai.chat://auth0.openai.com/ios/com.openai.chat/callback',
        grant_type: 'refresh_token',
        client_id: 'pdlLIX2Y72MIl2rhLhTE9VV9bN905kBh',
        refresh_token: token,
    }

    const res = await client.post(_url, data, {
        headers: headers,
    })

    console.log(res.data)
}

console.log(await auth0())
