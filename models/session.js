const jwt = require('jsonwebtoken')
const axios = require('axios')
const config = require('../config')

const sessions = {}

const findByKey = (key) => {
    const apis = sessions[key]
    if (apis) {
        return {
            key,
            apis
        }
    }
    return ''
}

const setApiToken = (key, api, apiToken) => {
    const session = sessions[key]
    if (session) {
        session[api] = apiToken
        return true
    }
    return false
}

const removeApiToken = (session, api) => {
    const key = session.key
    if (api && key) {
        sessions[key][api] = ''
    }
}

const removeSession = ({ key }) => {
    delete sessions[key]
}

const newSession = (key, api, apiToken) => {
    const apis = {}
    apis[api] = apiToken
    config.apis.map(api => {
        if (!apis[api]) {
            apis[api] = ''
        }
    })
    sessions[key] = apis
}

const updateSession = ({ key, apis }) => {
    sessions[key] = apis
}

const responseForExistingSession = (session) => {
    const apis = []
    iterateOverObject(session.apis, (api) => {
        if (!session.apis[api]) {
            const authUrl = generateAuthUrl(api, session.key)
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

const responseForNewSession = () => {
    let newKey = generateKey()
    const token = jwt.sign({ key: newKey }, process.env.SECRET)
    const apis = config.apis.map(api => {
        return { api, authUrl: generateAuthUrl(api, newKey) }
    })
    return { apis, token }
}

const hasActiveApis = ({ apis, key }) => {
    let empty = true
    iterateOverObject(apis, api => {
        if (apis[api]) {
            empty = false
        }
    })
    if (empty) {
        return false
    }
    return true
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

const requestApiToken = async (api, code) => {
    const request = config.tokenRequest(api, code)
    try {
        const response = await axios(request)
        return response.data.access_token
    } catch (error) {
        console.log('invalid request')
        return ''
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

module.exports = {
    responseForExistingSession,
    responseForNewSession,
    findByKey,
    requestApiToken,
    updateSession,
    newSession,
    removeApiToken,
    hasActiveApis,
    setApiToken,
    removeSession
}