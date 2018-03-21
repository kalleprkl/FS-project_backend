const youtubeRouter = require('express').Router()
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2
const jwt = require('jsonwebtoken')
const { generateState } = require('./helpers')
const axios = require('axios')
require('dotenv').config()

const states = {}

const service = google.youtube('v3');

const oauth2Client = new OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
)



youtubeRouter.post('/', (request, response) => {
    if (states[request.headers.authorization]) {
        console.log('youtube', states)
        response.send({ session: true })
    } else {
        delete states[request.headers.authorization]
        const state = generateState()
        states[state] = ''
        const authUrl = oauth2Client.generateAuthUrl({
            scope: 'https://www.googleapis.com/auth/youtube',
            access_type: 'offline',
            state
        })
        console.log('youtube', states)
        response.send({ authUrl, state, session: false })
    }
})

youtubeRouter.get('/auth', async (request, response) => {

    const state = request.query.state

    if (Object.keys(states).find(s => s === state)) {
        const code = request.query.code
        try {
            //const res = await axios.post('https://www.googleapis.com/oauth2/v4/token', `code=${code}&client_id${process.env.YOUTUBE_CLIENT_ID}&client_secret=${process.env.YOUTUBE_CLIENT_SECRET}&redirect_uri=${process.env.YOUTUBE_REDIRECT_URI}&grant_type=authorization_code`, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
            const res = await axios({
                method: 'post',
                url: 'https://www.googleapis.com/oauth2/v4/token',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                auth: {
                    username: process.env.YOUTUBE_CLIENT_ID,
                    password: process.env.YOUTUBE_CLIENT_SECRET
                },
                data: `grant_type=authorization_code&code=${code}&redirect_uri=${process.env.YOUTUBE_REDIRECT_URI}`
            })
            states[state] = res.data.access_token
            console.log(res)
        } catch (error) {
            console.log(error)
        }
    }

   /*if (Object.keys(states).find(s => s === state)) {
        const code = request.query.code
        oauth2Client.getToken(code, (err, tokens) => {
            if (!err) {
                states[state] = tokens.access_token
                oauth2Client.setCredentials(tokens)
            } else {
                console.log(err)
            }
        })
   }*/

    response.redirect('http://localhost:3000/')
})

google.options({
    auth: oauth2Client
})

const params = {
    params: {
        playlistId: 'PL34C1F26D03F5F9B8',
        maxResults: '1',
        part: 'snippet,contentDetails'
    }
}

youtubeRouter.get('/data', async (request, response) => {
    await service.playlistItems.list(params.params, (error, res) => {
        if (error) {
            console.log('The API returned an error: ' + error)
            return response.status(401)
        }
        response.json(res.data.items)
    })
})

youtubeRouter.get('/logout', (request, response) => {
    delete states[request.headers.authorization]
    //oauth2Client.revokeToken()
    //response.redirect('http://localhost:3000/')
    console.log('youtubelogout', states)
    response.status(200)
})

youtubeRouter.get('/data2', async (request, response) => {
    await service.activities.list({ channelId: 'UCfqbhEEocD5WFc1y6Xy7Zgg', maxResults: 3, snippet: { type: 'recommendation' }, part: 'snippet,contentDetails' }, (error, res) => {
        if (error) {
            console.log('The API returned an error: ' + error)
            return response.status(500).json({ error })
        }
        response.json(res.data.items)
    })
})

module.exports = youtubeRouter
