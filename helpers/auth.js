const jwt = require('jsonwebtoken')
const axios = require('axios')
const { sessions } = require('../sessions')
const config = require('../config')

const getApiToken = async (api, code) => {
    const request = config.tokenRequest(api, code)
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
            config.apis.map(a => {
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
    const urlTemplate = config.url(api, token)
    let authUrl = `${urlTemplate.baseUrl}?response_type=code&`
    Object.keys(urlTemplate.params).map(param => {
        const string = `${param}=${urlTemplate.params[param]}&`
        authUrl = authUrl.concat(string)
    })
    authUrl = authUrl.substr(0, authUrl.length - 1)
    return authUrl
}

const generateKey = () => {
    let string = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < 8; i++)
        string += possible.charAt(Math.floor(Math.random() * possible.length))
    return string
}

module.exports = {
    iterateOverObject,
    generateAuthUrl,
    generateKey,
    getAuth
}