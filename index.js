const http = require('http')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const app = express()
const sessionRouter = require('./controllers/session')
const dataRouter = require('./controllers/data')
const { extractKeyFromRequest } = require('./utils/middleware/auth')


if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

/*mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('connected to database')
    })
    .catch(err => {
        console.log(err)
    })

mongoose.Promise = global.Promise*/

app.use(cors())
app.use(bodyParser.json())
app.use(extractKeyFromRequest)

app.use('/auth', sessionRouter)
app.use('/data', dataRouter)

const server = http.createServer(app)

const port = process.env.PORT

server.listen(port, () => {
    console.log(`server running on port ${port}`)
})

/*server.on('close', () => {
    mongoose.connection.close()
})*/

module.exports = { app, server }


