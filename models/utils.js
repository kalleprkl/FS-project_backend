const config = require('../utils/config/session')

exports.validateInput = (input) => {
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
        if (typeof key === 'string') {
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
    },
    token: (token) => {
        if (typeof token === 'string') {
            return true
        }
        return false
    },
    playlists: (playlists) => {
        if (Array.isArray(playlists)) {
            return true
        }
        return false
    },
    channels: (channels) => {
        if (Array.isArray(channels)) {
            return true
        }
        return false
    }
}

exports.iterateOverObject = (object, action) => {
    const keyArray = Object.keys(object)
    if (Array.isArray(keyArray)) {
        keyArray.map(attr => {
            action(attr)
        })
    }
}

exports.generateKey = () => {
    let string = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < 8; i++)
        string += possible.charAt(Math.floor(Math.random() * possible.length))
    return string
}

