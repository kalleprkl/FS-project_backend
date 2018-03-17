const http = require('http')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()
const youtubeRouter = require('./controllers/youtube')

app.use(cors())
app.use(bodyParser.json())

app.use('/yt', youtubeRouter)

const server = http.createServer(app)

const port = '5000'

server.listen(port, () => {
    console.log(`server running on port ${port}`)
})



