const axios = require('axios')
const redditRouter = require('express').Router()
const fetch = require('isomorphic-fetch')
require('dotenv').config()

let state = ''

const generateAuthUrl = () => {
    const id = process.env.REDDIT_CLIENT_ID
    const type = 'code'
    const state = generateState()
    const uri = process.env.REDDIT_REDIRECT_URI
    const duration = 'permanent'
    const scope = 'identity'
    const authUrl = `https://www.reddit.com/api/v1/authorize?client_id=${id}&response_type=${type}&state=${state}&redirect_uri=${uri}&duration=${duration}&scope=${scope}`
    //const authUrl = 'https://www.reddit.com/api/v1/authorize?client_id=' + id + '&response_type=' + type + '&state=' + state + '&redirect_uri=' + uri + '&duration=' + duration + '&scope=' + scope 
    return authUrl
}

redditRouter.get('/', (request, response) => {
    const authUrl = generateAuthUrl()
    response.send(authUrl)
})

axios.interceptors.request.use(function (config) {
    console.log(config)
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

redditRouter.get('/auth', async (request, response) => {
    if (request.query.state === state) {
        
        const code = request.query.code
        
        /*try {
            
            /*const token = await axios.post('https://www.reddit.com/api/v1/access_token', {
                grant_type: 'authorization_code',
                client_id: process.env.REDDIT_CLIENT_ID,
                client_secret: process.env.REDDIT_CLIENT_SECRET,
                code: code,
                redirect_uri: process.env.REDDIT_REDIRECT_URI
            })
            console.log(token)*/

           /* const kakka = 'http://localhost:5000/r/kakka'
            const oikea = 'https://www.reddit.com/api/v1/access_token'
            const blista = 'http://localhost:3003/auth'
            const res = await axios.post(oikea,
                {
                    grant_type: `grant_type=authorization_code&code=${code}&redirect_uri=${process.env.REDDIT_REDIRECT_URI}`
                },
                {
                    headers: {
                        Authorization: `Basic ${Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64')}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
            console.log(res)

        } catch (exception) {
            //console.log('fuxk')
            //console.log(exception)
        }*/

        fetch('https://ssl.reddit.com/api/v1/access_token', {
            method: 'POST',
            body: {
                code: code,
                grant_type: "authorization_code",
                redirect_uri: process.env.REDDIT_REDIRECT_URI
            },
            headers: {
                'Authorization': `Basic ${Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64')}`,
                'User-Agent': 'web:randomfeed:v0.1 (by /u/culturalcrusont)',
                'Content-Type': "application/x-www-form-urlencoded"
            }
        }).then((response) => {
            console.log('HEP')
            console.log(response) // Object {error: "unsupported_grant_type"}
        })
    }

    /*const code = request.query.code
    const kakka = 'https://localhost:5000/r/kakka'
    const oikea = 'https://www.reddit.com/api/v1/access_token'
    const res = await axios.post(oikea,
        {
            grant_type: `authorization_code&code=${code}&redirect_uri=${process.env.REDDIT_REDIRECT_URI}`
        },
        {

            Authorization: `Basic ${Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'

        })*/

    /*const oikea = 'https://www.reddit.com/api/v1/access_token'
    const kakka = 'https://localhost:5000/r/kakka'
    await axios.post(oikea, { kissa: 'koira'})*/
})

redditRouter.post('/kakka', (request, response) => {
    console.log('KEKKE')
})

const generateState = () => {
    let string = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (let i = 0; i < 8; i++)
        string += possible.charAt(Math.floor(Math.random() * possible.length));
    state = string
    return string
}

const url = `https://www.reddit.com/api/v1/authorize?client_id=CLIENT_ID&response_type=TYPE&
    state=RANDOM_STRING&redirect_uri=URI&duration=DURATION&scope=SCOPE_STRING`

module.exports = redditRouter