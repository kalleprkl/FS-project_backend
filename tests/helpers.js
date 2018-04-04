const nock = require('nock')

exports.nockHelper = {
    youtube: (token, path, query, reply) => {
        nock('https://www.googleapis.com')
            //.log(console.log)
            .get(path)
            .query(query)
            .reply((uri, requestBody) => {
                return [200, reply]
            })
    },
    reddit: (token, path, reply) => {
        nock('https://oauth.reddit.com')
            //.log(console.log)
            .get(path)
            .reply((uri, requestBody) => {
                return [200, reply]
            })
    }
}

exports.nockBadRequest = {
    youtube: (url, path, query) => {
        nock(url)
            .get(path)
            .query(query)
            .reply(500)
    },
    reddit: (url, path) => {
        nock(url)
            .get(path)
            .reply(500)
    }
}