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
    process.env.YOUTUBE_REDIRECT_URL
)



youtubeRouter.get('/', (request, response) => {
    const state = generateState()
    states[state] = ''
    const authUrl = oauth2Client.generateAuthUrl({
        scope: 'https://www.googleapis.com/auth/youtube',
        state
    })
    response.send({ authUrl, state })
})

youtubeRouter.get('/auth', async (request, response) => {
    
    const state = request.query.state
    
    if (Object.keys(states).find(s => s === state)) {
        const code = request.query.code
        const response = await axios.post()
        oauth2Client.getToken(code, (err, tokens) => {
            if (!err) {
                states[state] = tokens.access_token
                oauth2Client.setCredentials(tokens)
            } else {
                console.log(err)
            }
        })
    }

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

youtubeRouter.get('/data/:id', async (request, response) => {
    await service.playlistItems.list(params.params, (error, res) => {
        if (error) {
            console.log('The API returned an error: ' + error)
            return response.status(500).json({ error })
        }
        response.json(res.data.items)
    })
})

youtubeRouter.get('/logout', (request, response) => {
    oauth2Client.revokeToken()
    response.redirect('http://localhost:3000/')
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

youtubeRouter.get('/fart', (request, response) => {
    try {
        console.log(fart)
        response.json(fart)
    } catch (error) {
        console.log(error)
        reponse.status(500).json(error)
    }
})

module.exports = youtubeRouter
