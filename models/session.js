const jwt = require('jsonwebtoken')
const axios = require('axios')
const config = require('../config')

const sessions = {}

const findByKey = (key) => {
    const apis = sessions[key]
    if (apis) {
        return sessionObject(key)
    }
    return ''
}

const newSession = (key) => {
    if (key) {
        const apis = {}
        config.apis.map(api => {
            apis[api] = ''
        })
        sessions[key] = apis
        return sessionObject(key)
    }
    return ''
}

const removeSession = ({ key }) => {
    delete sessions[key]
}

const responseForExistingSession = (session) => {
    const sessionApis = sessions[session.key]
    const apis = []
    iterateOverObject(sessionApis, (api) => {
        if (!sessionApis[api]) {
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

const sessionObject = (key) => {
    return {
        key,
        setApiToken: (api, apiToken) => {
            return setApiToken(key, api, apiToken)
        },
        getApiToken: (api) => {
            return getApiToken(key, api)
        },
        removeApiToken: (api, apiToken) => {
            return removeApiToken(key, api, apiToken)
        },
        hasActiveApis: () => {
            return hasActiveApis(key)
        }
    }
}

const setApiToken = (key, api, apiToken) => {
    const session = sessions[key]
    if (session) {
        session[api] = apiToken
        return true
    }
    return false
}

const getApiToken = (key, api) => {
    if (api && key) {
        return sessions[key][api]
    }
    return ""
}

const removeApiToken = (key, api) => {
    if (api && key) {
        sessions[key][api] = ''
        return true
    }
    return false
}

const hasActiveApis = (key) => {
    const apis = sessions[key]
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
    newSession,
    removeSession
}