const axios = require('axios')
const redditRouter = require('express').Router()
const fetch = require('isomorphic-fetch')
const { generateState } = require('./helpers')
require('dotenv').config()

let states = {}
let access_token

const generateAuthUrl = (state) => {
    const id = process.env.REDDIT_CLIENT_ID
    const type = 'code'
    const uri = process.env.REDDIT_REDIRECT_URI
    const duration = 'permanent'
    const scope = 'read'

    const authUrl = `https://www.reddit.com/api/v1/authorize?client_id=${id}&response_type=${type}&state=${state}&redirect_uri=${uri}&duration=${duration}&scope=${scope}`

    return authUrl
}

redditRouter.get('/', (request, response) => {
    const state = generateState()
    states[state] = ''
    const authUrl = generateAuthUrl(state)
    response.send({ authUrl, state })
})

redditRouter.get('/auth', async (request, response) => {
    const state = request.query.state

    if (Object.keys(states).find(s => s === state)) {

        const code = request.query.code

        try {
            const res = await axios({
                method: 'post',
                url: 'https://www.reddit.com/api/v1/access_token',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'web:randomfeed:v0.1 (by /u/culturalcrusont)'
                },
                auth: {
                    username: process.env.REDDIT_CLIENT_ID,
                    password: process.env.REDDIT_CLIENT_SECRET
                },
                data: `grant_type=authorization_code&code=${code}&redirect_uri=${process.env.REDDIT_REDIRECT_URI}`
            })


            states[state] = res.data.access_token
            response.redirect('http://localhost:3000/')


        } catch (exception) {
            console.log(exception.name)
        }
    }
})

redditRouter.get('/data', async (request, response) => {
    try {
        const res = await axios({
            url: 'https://oauth.reddit.com/best',
            headers: {
                'User-Agent': 'web:randomfeed:v0.1 (by /u/culturalcrusont)',
                'Authorization': "bearer " + states[request.headers.authorization]
            }
        })
        response.status(200).json(res.data.data.children)
    } catch (exception) {
        console.log('unauthorized')
        response.status(401)
    }
})

/*const generateState = () => {
    let string = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (let i = 0; i < 8; i++)
        string += possible.charAt(Math.floor(Math.random() * possible.length));
    return string
}*/

module.exports = redditRouter