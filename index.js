const http = require('http')
const express = require('express')
const Session = require('express-session')
const cors = require('cors')
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2
const bodyParser = require('body-parser')
const app = express()
const youtubeRouter = require('./controllers/youtube')

/*app.use(Session({
    secret: 'SEKRED',
    resave: true,
    saveUninitialized: true
}))*/

require('dotenv').config()

app.use(cors())
app.use(bodyParser.json())

app.use('/yt', youtubeRouter)

const server = http.createServer(app)

const port = '5000'

server.listen(port, () => {
    console.log(`server running on port ${port}`)
})



