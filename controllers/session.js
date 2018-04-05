const Session = require('../models/session')
const sessionRouter = require('express').Router()

var url = require('url')

sessionRouter.get('/', (request, response) => {
    console.log('hjep')
    //initial query from browser
    const session = Session.findByKey(request.key)
    let responseContent = ''
    if (session) {
        responseContent = Session.responseForExisting(session.key)
    } else {
        responseContent = Session.responseForNewSession()
    }
    response.send(responseContent)

})

sessionRouter.get('/:api', async (request, response) => {
    //ouath redirect uri
    const code = request.query.code
    const api = request.params.api
    const apiToken = await Session.requestApiToken(api, code)
    if (apiToken) {
        const key = request.key
        const session = Session.findByKey(key)
        if (session) {
            session.setApiToken(api, apiToken)
        } else {
            const newSession = Session.newSession(key)
            newSession.setApiToken(api, apiToken)
        }
    }
    response.redirect('http://localhost:3000/')
})

sessionRouter.get('/logout/:api', (request, response) => {

    const session = Session.findByKey(request.key)
    if (session) {
        session.removeApiToken(request.params.api)
        let responseContent = ''
        if (session.hasActiveApis()) {
            responseContent = Session.responseForExisting(session.key)
        } else {
            Session.removeSession(session.key)
            responseContent = Session.responseForNewSession()
        }
        response.send(responseContent)
    }
    response.status(400).send()
})

module.exports = sessionRouter