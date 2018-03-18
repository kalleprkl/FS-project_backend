const redditRouter = require('express').Router()
require('dotenv').config()

let state = ''

const generateAuthUrl = () => {
    const id = process.env.REDDIT_CLIENT_ID
    const code = 'code'
    const state = generateState()
    const uri = process.env.REDDIT_REDIRECT_URI
    const duration = 'permanent'
    const scope = 'identity'
    const authUrl = `https://www.reddit.com/api/v1/authorize?client_id=${id}&response_type=${code}&
    state=${state}&redirect_uri=${uri}&duration=${duration}&scope=${scope}`
    console.log(authUrl)
    return authUrl
}

redditRouter.get('/', (request, response) => {
    const authUrl = generateAuthUrl() 
    response.send(authUrl)
})

redditRouter.get('/auth', (request, response) => {
    const code = request.query.code
    console.log(code)
})

const generateState = () => {
    let string = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (let i = 0; i < 8; i++)
        string += possible.charAt(Math.floor(Math.random() * possible.length));
    state = string
    return string
}

const url = `https://www.reddit.com/api/v1/authorize?client_id=CLIENT_ID&response_type=TYPE&
    state=RANDOM_STRING&redirect_uri=URI&duration=DURATION&scope=SCOPE_STRING`

module.exports = redditRouter