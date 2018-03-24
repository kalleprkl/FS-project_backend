const jwt = require('jsonwebtoken')
const axios = require('axios')
const { sessions } = require('../sessions')
const config = require('../config')

exports.processInitialQuery = (request) => {
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
        return { apis }
    }
    const newKey = generateKey()
    const token = jwt.sign({ key: newKey }, process.env.SECRET)
    const apis = config.apis.map(api => {
        return { api, authUrl: generateAuthUrl(api, newKey) }
    })
    return { apis, token }
}

exports.getAuthorization = async (request) => {
    const key = request.key
    const api = request.params.api
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

exports.logout = (request) => {
    const api = request.params.api
    const key = request.key
    const sessionApis = sessions[key]
    if (sessionApis) {
        sessionApis[api] = ''
        let empty = true
        iterateOverObject(sessionApis, (api) => {
            if (sessionApis[api]) {
                empty = false
            }
        })
        if (empty) {
            delete sessions[key]
        }
    }
}

const generateAuthUrl = (api, key) => {
    const token = jwt.sign({ key }, process.env.SECRET)
    const template = config.url(api, token)
    let authUrl = `${template.baseUrl}?response_type=code&`
    iterateOverObject(template.params, (param) => {
        const string = `${param}=${template.params[param]}&`
        authUrl = authUrl.concat(string)
    })
    authUrl = authUrl.substr(0, authUrl.length - 1)
    return authUrl
}

const getApiToken = async (api, code) => {
    const request = config.tokenRequest(api, code)
    try {
        const response = await axios(request)
        return response.data.access_token
    } catch (error) {
        console.log('invalid request')
    }
}

const iterateOverObject = (object, action) => {
    Object.keys(object).map(attr => {
        action(attr)
    })
}

const generateKey = () => {
    let string = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < 8; i++)
        string += possible.charAt(Math.floor(Math.random() * possible.length))
    return string
}

