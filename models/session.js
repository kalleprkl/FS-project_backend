const jwt = require('jsonwebtoken')
const axios = require('axios')
axios.defaults.adapter = require('axios/lib/adapters/http')     //ugly from https://github.com/axios/axios/issues/305
const config = require('../utils/config/session')
const { validateInput, iterateOverObject, generateKey } = require('./utils')

//state of the controller. could be moved to db
const sessions = {
    sessions: {},
    new: (key, apis) => {
        sessions.sessions[key] = apis
    },
    has: (key) => {
        return sessions.sessions[key] ? true : false
    },
    get: (key) => {
        return sessions.sessions[key]
    },
    forget: (key, api) => {
        sessions.sessions[key][api] = ''
    },
    remove: (key) => {
        delete sessions.sessions[key]
    }
}


exports.findByKey = (key) => {
    console.log('SESSIONS', sessions.sessions)
    if (validateInput({ key }) && sessions.has(key)) {
        return sessionObject(key)
    }
    return ''
}

exports.newSession = (key) => {
    if (validateInput({ key })) {
        const apis = {}
        config.apis.map(api => {
            apis[api] = ''
        })
        sessions.new(key, apis)
        return sessionObject(key)
    }
    return ''
}

exports.removeSession = (key) => {
    if (validateInput({ key }) && sessions.has(key)) {
        sessions.remove(key)
        return true
    }
    return false
}

exports.responseForExisting = (key) => {
    if (validateInput({ key }) && sessions.has(key)) {
        const sessionApis = sessions.get(key)
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
    if (validateInput({ api, code })) {
        const request = config.tokenRequest(api, code)
        try {
            const response = await axios.post(request.url, request.data, { headers: request.headers, auth: request.auth })
            return response.data.access_token
        } catch (error) {
        }
    }
    return ''
}

const sessionObject = (key) => {
    if (validateInput({ key }) && sessions.has(key)) {
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
    if (validateInput({ key, api, apiToken }) && sessions.has(key)) {
        const apis = sessions.get(key)
        if (apis) {
            apis[api] = apiToken
            return true
        }
    }
    return false
}

const getApiToken = (key, api) => {
    console.log('getApiToken', sessions.sessions)
    if (validateInput({ key, api }) && sessions.has(key)) {
        const apis = sessions.get(key)
        return apis[api]
    }
    return ''
}

const removeApiToken = (key, api) => {
    if (validateInput({ key, api }) && sessions.has(key) && sessions.get(key)[api]) {
        sessions.forget(key, api)
        return true
    }
    return false
}

const hasActiveApis = (key) => {
    if (validateInput({ key }) && sessions.has(key)) {
        const apis = sessions.get(key)
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

const generateAuthUrl = (api, key) => {
    if (validateInput({ api, key })) {
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









