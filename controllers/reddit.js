const axios = require('axios')
const redditRouter = require('express').Router()
const fetch = require('isomorphic-fetch')
require('dotenv').config()

let state = ''
let access_token

const generateAuthUrl = () => {
    
    const id = process.env.REDDIT_CLIENT_ID
    const type = 'code'
    const state = generateState()
    const uri = process.env.REDDIT_REDIRECT_URI
    const duration = 'permanent'
    const scope = 'identity'
    
    const authUrl = `https://www.reddit.com/api/v1/authorize?client_id=${id}&response_type=${type}&state=${state}&redirect_uri=${uri}&duration=${duration}&scope=${scope}`
    
    return authUrl
}

redditRouter.get('/', (request, response) => {
    const authUrl = generateAuthUrl()
    response.send(authUrl)
})

redditRouter.get('/auth', async (request, response) => {

    if (request.query.state === state) {

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

            access_token =  res.data.access_token
            response.redirect('http://localhost:3000/')
        
        } catch (exception) {
            console.log(exception.name)
        }
    }
})

redditRouter.get('/data', async (request, response) => {
    try {
        const res = await axios({
            url: 'https://oauth.reddit.com/api/v1/me',
            headers : {
                'User-Agent': 'web:randomfeed:v0.1 (by /u/culturalcrusont)',
                'Authorization': "bearer " + access_token
            }
        })
        console.log(res)
        response.status(200)
    } catch (exception) {
        console.log('fuckd')
        console.log(exception.name)
        response.status(500)
    }
})

const generateState = () => {
    let string = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (let i = 0; i < 8; i++)
        string += possible.charAt(Math.floor(Math.random() * possible.length));
    state = string
    return string
}

module.exports = redditRouter