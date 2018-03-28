
exports.apis = ['youtube', 'reddit']

exports.tokenRequest = (api, code) => {
    if (api === 'youtube') {
        const request = useTemplate({
            url: 'https://www.googleapis.com/oauth2/v4/token',
            auth: {
                username: process.env.YOUTUBE_CLIENT_ID,
                password: process.env.YOUTUBE_CLIENT_SECRET
            },
            data: `grant_type=authorization_code&code=${code}&redirect_uri=${process.env.YOUTUBE_REDIRECT_URI}`
        })
        return request
    }
    if (api = 'reddit') {
        const request = useTemplate({
            url: 'https://www.reddit.com/api/v1/access_token',
            headers: {
                'User-Agent': process.env.REDDIT_USER_AGENT,
            },
            auth: {
                username: process.env.REDDIT_CLIENT_ID,
                password: process.env.REDDIT_CLIENT_SECRET
            },
            data: `grant_type=authorization_code&code=${code}&redirect_uri=${process.env.REDDIT_REDIRECT_URI}`
        })
        return request

    }
}

exports.url = (api, token) => {
    switch (api) {
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
            return {
                baseUrl: 'https://www.reddit.com/api/v1/authorize',
                params: {
                    client_id: process.env.REDDIT_CLIENT_ID,
                    response_type: 'code',
                    state: token,
                    redirect_uri: process.env.REDDIT_REDIRECT_URI,
                    duration: 'permanent',
                    scope: 'read'
                }
            }
    }
}

const useTemplate = (insert) => {
    const template = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    }
    const merge = Object.assign({}, template, insert)
    if (insert.headers) {
        const headers = Object.assign({}, template.headers, insert.headers)
        merge.headers = headers
    }
    return merge
}
