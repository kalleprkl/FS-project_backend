const http = require('http')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()
const youtubeRouter = require('./controllers/youtube')
const redditRouter = require('./controllers/reddit')
const { checkToken } = require('./middleware/auth')

const logger = (request, response, next) => {
    
    if (request) {
        console.log('REQUEST',request.headers, request.body)
    }
    if (response) {
        console.log('RESPONSE')
    }

    next()
}


app.use(cors())
app.use(bodyParser.json())
app.use(checkToken)

app.use('/yt', youtubeRouter)
app.use('/r', redditRouter)

const server = http.createServer(app)

const port = '5000'

server.listen(port, () => {
    console.log(`server running on port ${port}`)
})


