const http = require('http')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const app = express()
const youtubeRouter = require('./controllers/youtube')
const redditRouter = require('./controllers/reddit')
const authRouter = require('./controllers/authRouter')
const { checkToken } = require('./middleware/auth')


if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('connected to database')
    })
    .catch(err => {
        console.log(err)
    })

mongoose.Promise = global.Promise

app.use(cors())
app.use(bodyParser.json())
app.use(checkToken)

app.use('/auth', authRouter)
app.use('/yt', youtubeRouter)
app.use('/r', redditRouter)

const server = http.createServer(app)

const port = process.env.PORT

server.listen(port, () => {
    console.log(`server running on port ${port}`)
})

server.on('close', () => {
    mongoose.connection.close()
})


