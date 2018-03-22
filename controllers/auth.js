const jwt = require('jsonwebtoken')
const axios = require('axios')
require('dotenv').config()

exports.checkToken = (token) => {
    let key = ''
    try {
        key = jwt.verify(token, process.env.SECRET).key
    } catch (error) {
        console.log('token missing or invalid')
    }
    return key
}

exports.generateAuthUrl = (domain) => {
    const token = jwt.sign({ key: generateKey(), date: new Date() }, process.env.SECRET)
    const config = configUrl(domain, token)
    let authUrl = config.baseUrl + '?response_type=code&'
    Object.keys(config.params).map(param => {
        const string = `${param}=${config.params[param]}&`
        authUrl = authUrl.concat(string)
    })
    authUrl = authUrl.substr(0, authUrl.length - 1)
    return { url: authUrl, token }
}

exports.getApiToken = async (domain, code) => {
    const request = configTokenRequest(domain, code)
    try {
        const response = await axios(request)
        return response.data.access_token
    } catch (error) {
        console.log('invalid request')
    }
}

const configTokenRequest = (domain, code) => {
    switch (domain) {
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

const configUrl = (domain, token) => {
    switch (domain) {
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
        string += possible.charAt(Math.floor(Math.random() * possible.length));
    return string
}