const jwt = require('jsonwebtoken')
const axios = require('axios')
axios.defaults.adapter = require('axios/lib/adapters/http')     //ugly from https://github.com/axios/axios/issues/305
const config = require('../utils/config/session')

let sessions = {}        //not const because tests

exports.findByKey = (key) => {
    if (validateInput({ key })) {
        const apis = sessions[key]
        return sessionObject(key)
    }
    return ''
}

exports.newSession = (key) => {
    // can't use validateInput because it checks if the key is in sessions
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

exports.removeSession = (key) => {
    if (validateInput({ key })) {
        delete sessions[key]
        return true
    }
    return false
}

exports.responseForExisting = (key) => {
    if (validateInput({ key })) {
        const sessionApis = sessions[key]
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
    if (validateInput({ key })) {
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
    if (validateInput({ key, api, apiToken })) {
        const apis = sessions[key]
        if (apis) {
            apis[api] = apiToken
            return true
        }
    }
    return false
}

const getApiToken = (key, api) => {
    if (validateInput({ key, api })) {
        const apis = sessions[key]
        return apis[api]
    }
    return ''
}

const removeApiToken = (key, api) => {
    if (validateInput({ key, api })) {
        const apis = sessions[key]
        if (apis[api]) {
            apis[api] = ''
            return true
        }
    }
    return false
}

const hasActiveApis = (key) => {
    if (validateInput({ key })) {
        const apis = sessions[key]
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
    if (validateInput({ api }) && typeof key === 'string') {
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

const validateInput = (input) => {
    if (input) {
        const inputKeys = Object.keys(input)
        if (Array.isArray(inputKeys) && inputKeys.length > 0) {
            let valid = true
            for (let i = 0; i < inputKeys.length; i++) {
                const key = inputKeys[i]
                const validator = validators[key]
                if (!validator || !validator(input[key])) {
                    return false
                }
            }
            return true
        }
        return false
    }
    return false
}

const validators = {
    key: (key) => {
        if (typeof key === 'string' && sessions[key]) {
            return true
        }
        return false
    },
    api: (api) => {
        if (typeof api === 'string' && config.apis.includes(api)) {
            return true
        }
        return false
    },
    code: (code) => {
        if (typeof code === 'string') {
            return true
        }
        return false
    },
    apiToken: (apiToken) => {
        if (typeof apiToken === 'string') {
            return true
        }
        return false
    }
}

const iterateOverObject = (object, action) => {
    const keyArray = Object.keys(object)
    if (Array.isArray(keyArray)) {
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

