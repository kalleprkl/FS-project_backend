const redditRouter = require('express').Router()
const { checkToken, generateAuthUrl, getApiToken } = require('./auth')
const Reddit = require('../models/reddit')

const sessions = {}

redditRouter.get('/', (request, response) => {
    const key = request.key
    if (key) {
        if (Object.keys(sessions).includes(key) && sessions[key]) {
            return response.send({ isActive: true })
        }
    }
    const { authUrl, token } = generateAuthUrl('reddit')
    response.send({ authUrl, token, isActive: false })
})

redditRouter.get('/auth', async (request, response) => {
    const key = request.key
    if (key) {
        const code = request.query.code
        const apiToken = await getApiToken('reddit', code)
        sessions[key] = apiToken
    }
    response.redirect('http://localhost:3000/')
})

redditRouter.get('/data', async (request, response) => {
    const key = request.key
    if (key) {
        const apiToken = sessions[key]
        const data = await Reddit.get(apiToken)
        return response.status(200).send(data)
    } 
    response.status(401).send()
})

redditRouter.get('/logout', (request, response) => {
    const key = request.key
    delete sessions[key]
    const { authUrl, token } = generateAuthUrl('reddit')
    response.status(200).send({ authUrl, token, isActive: false })
})

module.exports = redditRouter