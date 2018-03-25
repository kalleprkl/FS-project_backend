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

const updateSession = ({ key, apis }) => {
    sessions[key] = apis
}

const addSession = (session) => {
    const apis = session.apis
    config.apis.map(api => {
         if (!apis[api]) {
             apis[api] = ''
         }
    })
    sessions[session.key] = apis
}

const processInitialQuery = (key) => {
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
    const newKey = generateKey()
    const token = jwt.sign({ key: newKey }, process.env.SECRET)
    const apis = config.apis.map(api => {
        return { api, authUrl: generateAuthUrl(api, newKey) }
    })
    return { apis, token }
}

const useExistingSession = (session) => {
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

const createNewSession = (key) => {
    let newKey = generateKey()
    if (key) {
        newKey = key
    }
    const token = jwt.sign({ key: newKey }, process.env.SECRET)
    const apis = config.apis.map(api => {
        return { api, authUrl: generateAuthUrl(api, newKey) }
    })
    return { apis, token }
}

const getAuthorization = async (api, key, code) => {
    if (key && code) {
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

const logout = (api, key) => {
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
    if (sessions[key]) {
        const response = useExistingSession(findByKey(key))
        return processInitialQuery(key)
    } else {
        const newKey = generateKey()
        return processInitialQuery(newKey)
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
    logout, 
    useExistingSession,
    createNewSession,
    findByKey,
    getApiToken,
    updateSession,
    addSession,
    sessions
}