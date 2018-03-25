const Session = require('../models/session')
const sessionRouter = require('express').Router()

sessionRouter.get('/', (request, response) => {
    const session = Session.findByKey(request.key)
    let responseContent = ''
    if (session) {
        responseContent = Session.useExistingSession(session)
    } else {
        responseContent = Session.createNewSession()
    }
    response.send(responseContent)
})

sessionRouter.get('/:api', async (request, response) => {
    const code = request.query.code
    if (code) {
        const api = request.params.api
        const apiToken = await Session.getApiToken(api, code)
        if (apiToken) {
            const key = request.key
            const session = Session.findByKey(key)
            if (session) {
                session.apis[api] = apiToken
                Session.updateSession(session)
            } else {
                const apis = {}
                apis[api] = apiToken
                const newSession = {
                    key,
                    apis
                }
                Session.addSession(newSession)
            }
        }
    }
    response.redirect('http://localhost:3000/')
})

sessionRouter.get('/logout/:api', (request, response) => {
    const responseContent = Session.logout(request.params.api, request.key)
    response.send(responseContent)
})

module.exports = sessionRouter