const youtubeRouter = require('express').Router()
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2
require('dotenv').config()

const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
)

const authUrl = oauth2Client.generateAuthUrl({
    scope: 'https://www.googleapis.com/auth/youtube'
})

console.log(authUrl)

youtubeRouter.get('/', (request, response) => {
    response.send(authUrl)
})

youtubeRouter.get('/auth', (request, reponse) => {
    const code = request.query.code
    oauth2Client.getToken(code, (err, tokens) => {
        if (!err) {
            oauth2Client.setCredentials(tokens)
            console.log(tokens)
        } else {
            console.log(err)
        }
    })
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
    var service = google.youtube('v3');
    service.playlistItems.list(params.params, function (error, res) {
        if (error) {
            console.log('The API returned an error: ' + error)
            return response.status(500).json({ error })
            
        }
        response.json(res.data.items)
    })
})

module.exports = youtubeRouter
