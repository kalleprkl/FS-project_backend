require('dotenv').config()

const generateKey = () => {
    let string = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (let i = 0; i < 8; i++)
        string += possible.charAt(Math.floor(Math.random() * possible.length));
    return string
}

const generateAuthUrl = (config) => {

    let authUrl = config.baseUrl + '?response_type=code&'

    Object.keys(config.params).map(param => {
        const string = `${param}=${config.params[param]}&`
        authUrl = authUrl.concat(string)
    })

    return authUrl
}

const config = (domain, token) => {
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
    }

}

module.exports = { generateKey, generateAuthUrl, config }