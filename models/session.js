const jwt = require('jsonwebtoken')
const axios = require('axios')
const config = require('../utils/config/session')

let sessions = {}   //not const because tests

exports.findByKey = (key) => {
    const apis = sessions[key]
    if (apis) {
        return sessionObject(key)
    }
    return ''
}

exports.newSession = (key) => {
    if (typeof key === 'string') {
        const apis = {}
        config.apis.map(api => {
            apis[api] = ''
        })
        sessions[key] = apis
        return sessionObject(key)
    }
    return ''
}

exports.removeSession = (session) => {
    if (sessions[session.key]) {
        delete sessions[session.key]
    }
}

exports.responseForExisting = (session) => {
    if (session) {
        const key = session.key
        const sessionApis = sessions[key]
        if (sessionApis) {
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
    }
    return ''
}

exports.responseForNewSession = () => {
    let newKey = generateKey()
    const token = jwt.sign({ key: newKey }, process.env.SECRET)
    const apis = config.apis.map(api => {
        return { api, authUrl: generateAuthUrl(api, newKey) }
    })
    return { apis, token }
}

exports.requestApiToken = async (api, code) => {
    if (api && code) {
        const request = config.tokenRequest(api, code)
        try {
            const response = await axios(request)
            return response.data.access_token
        } catch (error) {
        }
    }
    return ''
}

const sessionObject = (key) => {
    if (key) {
        return {
            key,
            setApiToken: (api, apiToken) => {
                return setApiToken(key, api, apiToken)
            },
            getApiToken: (api) => {
                return getApiToken(key, api)
            },
            removeApiToken: (api) => {
                return removeApiToken(key, api)
            },
            hasActiveApis: () => {
                return hasActiveApis(key)
            }
        }
    }
    return ''
}

const setApiToken = (key, api, apiToken) => {
    const apis = sessions[key]
    if (checkInput(apis, api, apiToken)) {
        apis[api] = apiToken
        return true
    }
    return false
}

const getApiToken = (key, api) => {
    const apis = sessions[key]
    if (checkInput(apis, api)) {
        return apis[api]
    }
    return ''
}

const removeApiToken = (key, api) => {
    const apis = sessions[key]
    if (checkInput(apis, api)) {
        if (apis[api]) {
            apis[api] = ''
            return true
        }
    }
    return false
}

const hasActiveApis = (key) => {
    const apis = sessions[key]
    if (apis) {
        let empty = true
        iterateOverObject(apis, api => {
            if (apis[api]) {
                empty = false
            }
        })
        if (empty) {
            return false
        } else {
            return true
        }
    }
    return false
}

const checkInput = (apis, api, apiToken) => {
    if (apis && Object.keys(apis).includes(api)) {
        if (apiToken && typeof apiToken !== 'string') {
            return false
        }
        return true
    }
    return false
}

const generateAuthUrl = (api, key) => {
    if (typeof api === 'string' && typeof api === 'string' && config.apis.includes(api)) {
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
    return ''
}



const iterateOverObject = (object, action) => {
    const keyArray = Object.keys(object)
    if (keyArray) {
        keyArray.map(attr => {
            action(attr)
        })
    }
}

const generateKey = () => {
    let string = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < 8; i++)
        string += possible.charAt(Math.floor(Math.random() * possible.length))
    return string
}

