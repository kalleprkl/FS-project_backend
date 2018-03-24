const jwt = require('jsonwebtoken')
const axios = require('axios')
const { iterateOverObject, generateAuthUrl, generateKey,getAuth } = require('../helpers/auth')
const authRouter = require('express').Router()
const { sessions } = require('../sessions')
const config = require('../config')

authRouter.get('/', (request, response) => {
    //console.log(sessions)
    const key = request.key
    const sessionApis = sessions[key]
    if (key && sessionApis) {
        const apis = []
        iterateOverObject(sessionApis, (api) => {
            if (!sessionApis[api]) {
                const authUrl = generateAuthUrl(api, key)
                apis.push({
                    api,
                    authUrl
                })
            } else {
                apis.push({
                    api,
                    authUrl: ''
                })
            }
        })
        return response.send({ apis })
    }
    const newKey = generateKey()
    const token = jwt.sign({ key: newKey }, process.env.SECRET)
    const apis = config.apis.map(api => {
        return { api, authUrl: generateAuthUrl(api, newKey) }
    })
    response.send({ token, apis })
})

authRouter.get('/r', (request, response) => {
    getAuth('reddit', request)
    response.redirect('http://localhost:3000/')
})

authRouter.get('/yt', (request, response) => {
    getAuth('youtube', request)
    response.redirect('http://localhost:3000/')
})

module.exports = authRouter