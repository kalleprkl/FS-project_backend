const http = require('http')
const express = require('express')
const Session = require('express-session')
const cors = require('cors')
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2;
const bodyParser = require('body-parser')
const app = express()
//const youtubeRouter = require('./controllers/youtube')

/*app.use(Session({
    secret: 'SEKRED',
    resave: true,
    saveUninitialized: true
}))*/

require('dotenv').config()

app.use(cors())
app.use(bodyParser.json())

const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
)

const authUrl = oauth2Client.generateAuthUrl({
    scope: 'https://www.googleapis.com/auth/youtube'
})

console.log(authUrl)

app.get('/', (request, response) => {
    response.send(authUrl)
})

app.get('/goauth', (request, reponse) => {
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
        channelId: 'UCrTNhL_yO3tPTdQ5XgmmWjA',
        maxResults: '25',
        part: 'snippet,contentDetails'
    }
}

app.get('/api/yt', async (request, response) => {
    var service = google.youtube('v3');
    //var parameters = removeEmptyParameters(requestData['params']);
    //parameters['auth'] = auth;
    service.playlists.list(params.params, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            
        }
        console.log(response.data.items);
    });
    
})

const server = http.createServer(app)

const port = '5000'

server.listen(port, () => {
    console.log(`server running on port ${port}`)
})



