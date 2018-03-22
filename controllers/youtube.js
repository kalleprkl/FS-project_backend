const youtubeRouter = require('express').Router()
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2
const jwt = require('jsonwebtoken')
const { generateKey } = require('./helpers')
const axios = require('axios')
require('dotenv').config()

const states = {}

const service = google.youtube('v3');

const oauth2Client = new OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
)



/*youtubeRouter.get('/old', (request, response) => {
    if (states[request.headers.authorization]) {
        console.log('youtube', states)
        response.send({ session: true })
    } else {
        delete states[request.headers.authorization]
        const state = generateKey()
        states[state] = ''
        const authUrl = oauth2Client.generateAuthUrl({
            scope: 'https://www.googleapis.com/auth/youtube',
            access_type: 'offline',
            state
        })
        console.log('youtube', states)
        response.send({ authUrl, state, session: false })
    }
})*/

youtubeRouter.get('/', (request, response) => {

    const token = request.headers.authorization

    let decodedToken = ''
    try {
        decodedToken = jwt.verify(token, process.env.SECRET)
    } catch (error) {
        console.log('token missing or invalid')
    }

    if (decodedToken) {
        const key = decodedToken.key
        if (Object.keys(states).includes(key) && states[key]) {
            return response.send({ isActive: true })
        }
    }

    const newToken = jwt.sign({ key: generateKey(), date: new Date() }, process.env.SECRET)
    const authUrl = oauth2Client.generateAuthUrl({
        scope: 'https://www.googleapis.com/auth/youtube',
        access_type: 'offline',
        state: newToken
    })
    response.send({ authUrl, token: newToken, isActive: false })

})

youtubeRouter.get('/auth', async (request, response) => {

    const token = request.query.state
    const decodedToken = jwt.verify(token, process.env.SECRET)
    const key = decodedToken.key
    if (key) {
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
            states[key] = res.data.access_token
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
    const token = request.headers.authorization
    const decodedToken = jwt.verify(token, process.env.SECRET)
    const key = decodedToken.key
    if (key) {
        const apiToken = states[key]
        try {
            const res = await axios({
                url: 'https://www.googleapis.com/youtube/v3/subscriptions/?mine=true&part=snippet%2CcontentDetails',
                headers: {
                    'Authorization': `Bearer ${apiToken}`
                }
            })
            const channels = res.data.items.map(item => item.snippet.resourceId.channelId)
            const channelPlaylists = await Promise.all(channels.map(async channel => {
                //playlists of a channel
                const res = await axios({
                    url: `https://www.googleapis.com/youtube/v3/playlists?maxResults=25&channelId=${channel}&part=snippet%2CcontentDetails`,
                    headers: {
                        'Authorization': `Bearer ${apiToken}`
                    }   
                })
                const ids = res.data.items.map(item => item.id)
                return ids
            }))
            const playlists = []
            channelPlaylists.map(cpl => cpl.map(pl => playlists.push(pl)))
            const videos = await Promise.all(playlists.map(async playlist => {
                const res = await axios({
                    url: `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlist}&maxResults=1&part=snippet%2CcontentDetails`,
                    headers: {
                        'Authorization': `Bearer ${apiToken}`
                    }
                })
                const videoIds = []
                res.data.items.map(item => videoIds.push(item.snippet.resourceId.videoId))
                return res.data.items[0].snippet.resourceId.videoId
            }))
            response.status(200).send(videos)
        } catch (error) {
            
        }
    }
    

    /*await service.playlistItems.list(params.params, (error, res) => {
        if (error) {
            console.log('The API returned an error: ' + error)
            return response.status(401)
        }
        response.json(res.data.items)
    })*/
})

youtubeRouter.get('/logout', (request, response) => {
    const key = jwt.verify(request.headers.authorization, process.env.SECRET).key
    delete states[key]
    const newToken = jwt.sign({ key: generateKey(), date: new Date() }, process.env.SECRET)
    const authUrl = oauth2Client.generateAuthUrl({
        scope: 'https://www.googleapis.com/auth/youtube',
        access_type: 'offline',
        state: newToken
    })
    response.status(200).send({ authUrl, token: newToken, isActive: false })
})

module.exports = youtubeRouter
