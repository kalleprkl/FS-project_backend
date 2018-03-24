const youtubeRouter = require('express').Router()
const { generateAuthUrl, getApiToken } = require('./auth')
const { sessions } = require('../sessions')
const Youtube = require('../models/youtube')

/*const sessions = {}

youtubeRouter.get('/', (request, response) => {
    const key = request.key
    if (key) {
        if (Object.keys(sessions).includes(key) && sessions[key]) {
            return response.send({ isActive: true })
        }
    }
    const { authUrl, token } = generateAuthUrl('youtube')
    response.send({ authUrl, token, isActive: false })
})

youtubeRouter.get('/auth', async (request, response) => {
    const key = request.key
    if (key) {
        const code = request.query.code
        const apiToken = await getApiToken('youtube', code)
        sessions[key] = apiToken
    }
    response.redirect('http://localhost:3000/')
})*/

youtubeRouter.get('/data', async (request, response) => {
    const key = request.key
    if (key) {
        const apiToken = sessions[key].youtube
        const videos = await Youtube.get(apiToken)
        response.status(200).send(videos)
    }
    response.status(401).send()
})

/*youtubeRouter.get('/logout', (request, response) => {
    const key = request.key
    delete sessions[key]
    const { authUrl, token } = generateAuthUrl('youtube')
    response.status(200).send({ authUrl, token, isActive: false })
})*/

module.exports = youtubeRouter
