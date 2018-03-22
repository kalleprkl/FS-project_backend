const youtubeRouter = require('express').Router()
const { checkToken, generateAuthUrl, getApiToken } = require('./auth')
const Youtube = require('../models/youtube')

const sessions = {}

youtubeRouter.get('/', (request, response) => {
    const key = checkToken(request.headers.authorization)
    if (key) {
        if (Object.keys(sessions).includes(key) && sessions[key]) {
            return response.send({ isActive: true })
        }
    }
    const authUrl = generateAuthUrl('youtube')
    response.send({ authUrl: authUrl.url, token: authUrl.token, isActive: false })
})

youtubeRouter.get('/auth', async (request, response) => {
    const key = checkToken(request.query.state)
    if (key) {
        const code = request.query.code
        const apiToken = await getApiToken('youtube', code)
        sessions[key] = apiToken
    }
    response.redirect('http://localhost:3000/')
})

youtubeRouter.get('/data', async (request, response) => {
    const key = checkToken(request.headers.authorization)
    if (key) {
        const apiToken = sessions[key]
        const videos = await Youtube.get(apiToken)
        response.status(200).send(videos)
    }
    response.status(401).send()
})

youtubeRouter.get('/logout', (request, response) => {
    const key = checkToken(request.headers.authorization)
    delete sessions[key]
    const authUrl = generateAuthUrl('youtube')
    response.status(200).send({ authUrl: authUrl.url, token: authUrl.token, isActive: false })
})

module.exports = youtubeRouter
