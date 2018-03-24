const jwt = require('jsonwebtoken')
const axios = require('axios')
const authRouter = require('express').Router()

const config = ['youtube', 'reddit']

const sessions = {
    /*'d4COHeNV': {
        youtube: '<apiToken>',
        reddit: '<apiToken>'
    }*/
}

authRouter.get('/', (request, response) => {
    const key = request.key
    const sessionApis = sessions[key]
    if (key && sessionApis) {
        const apis = []
        iterateOverObject(sessionApis, (api) => {
            if (!sessionApis[api]) {
                const authUrl = generateAuthUrl(api, key)
                apis.push({
                    api,
                    authUrl
                })
            } else {
                apis.push({
                    api,
                    authUrl: ''
                })
            }
        })
        return response.send({ apis })
    }
    const newKey = generateKey()
    const token = jwt.sign({ key: newKey }, process.env.SECRET)
    const apis = config.map(api => {
        return { api, authUrl: generateAuthUrl(api, newKey) }
    })
    response.send({ token, apis })
})

authRouter.get('/r', (request, response) => {
    getAuth('reddit', request)
    response.redirect('http://localhost:3000/')
})

authRouter.get('/yt', (request, response) => {
    getAuth('youtube', request)
    response.redirect('http://localhost:3000/')
})

/////////////////////////////////////////////////////////////////////////////

const getApiToken = async (api, code) => {
    const request = configTokenRequest(api, code)
    try {
        const response = await axios(request)
        return response.data.access_token
    } catch (error) {
        console.log('invalid request')
    }
}

const getAuth = async (api, request) => {
    const key = request.key
    if (key) {
        const code = request.query.code
        const apiToken = await getApiToken(api, code)
        const session = sessions[key]
        if (session) {
            session[api] = apiToken
            sessions[key] = session
        } else {
            const newSession = {}
            config.map(a => {
                if (a === api) {
                    newSession[api] = apiToken
                } else {
                    newSession[a] = ''
                }
            })
            sessions[key] = newSession
        }
    }
}

const iterateOverObject = (object, action) => {
    Object.keys(object).map(attr => {
        action(attr)
    })
}

const generateAuthUrl = (api, key) => {
    const token = jwt.sign({ key }, process.env.SECRET)
    const config = configUrl(api, token)
    let authUrl = `${config.baseUrl}?response_type=code&`
    Object.keys(config.params).map(param => {
        const string = `${param}=${config.params[param]}&`
        authUrl = authUrl.concat(string)
    })
    authUrl = authUrl.substr(0, authUrl.length - 1)
    return authUrl
}



const configTokenRequest = (api, code) => {
    switch (api) {
        case 'youtube':
            return {
                method: 'post',
                url: 'https://www.googleapis.com/oauth2/v4/token',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                auth: {
                    username: process.env.YOUTUBE_CLIENT_ID,
                    password: process.env.YOUTUBE_CLIENT_SECRET
                },
                data: `grant_type=authorization_code&code=${code}&redirect_uri=${process.env.YOUTUBE_REDIRECT_URI}`
            }
        case 'reddit':
            return {
                method: 'post',
                url: 'https://www.reddit.com/api/v1/access_token',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': process.env.REDDIT_USER_AGENT
                },
                auth: {
                    username: process.env.REDDIT_CLIENT_ID,
                    password: process.env.REDDIT_CLIENT_SECRET
                },
                data: `grant_type=authorization_code&code=${code}&redirect_uri=${process.env.REDDIT_REDIRECT_URI}`
            }
    }
}

const configUrl = (api, token) => {
    switch (api) {
        case 'youtube':
            return {
                baseUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
                params: {
                    client_id: process.env.YOUTUBE_CLIENT_ID,
                    redirect_uri: process.env.YOUTUBE_REDIRECT_URI,
                    scope: 'https://www.googleapis.com/auth/youtube',
                    access_type: 'offline',
                    state: token
                }
            }
        case 'reddit':
            return {
                baseUrl: 'https://www.reddit.com/api/v1/authorize',
                params: {
                    client_id: process.env.REDDIT_CLIENT_ID,
                    response_type: 'code',
                    state: token,
                    redirect_uri: process.env.REDDIT_REDIRECT_URI,
                    duration: 'permanent',
                    scope: 'read'
                }
            }
    }
}

const generateKey = () => {
    let string = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < 8; i++)
        string += possible.charAt(Math.floor(Math.random() * possible.length))
    return string
}


module.exports = authRouter