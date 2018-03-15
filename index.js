const http = require('http')
const express = require('express')
const cors = require('cors')
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const bodyParser = require('body-parser')
const app = express()
const youtubeRouter = require('./controllers/youtube')

require('dotenv').config()

const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
)



app.use(cors())
app.use(bodyParser.json())

app.use('/api/yt', youtubeRouter)

const server = http.createServer(app)

const port = '3001'

server.listen(port, () => {
    console.log(`server running on port ${port}`)
})



