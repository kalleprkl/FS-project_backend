const Session = require('../models/session')
const sessionRouter = require('express').Router()

sessionRouter.get('/', (request, response) => {

    const session = Session.findByKey(request.key)
    let responseContent = ''
    if (session) {
        responseContent = Session.responseForExistingSession(session)
    } else {
        responseContent = Session.responseForNewSession()
    }
    response.send(responseContent)

})

sessionRouter.get('/:api', async (request, response) => {

    const code = request.query.code
    if (code) {
        const api = request.params.api
        const apiToken = await Session.requestApiToken(api, code)
        if (apiToken) {
            const key = request.key
            const isSet = Session.setApiToken(key, api, apiToken)
            if (!isSet) {
                Session.newSession(key, api, apiToken)
            }
        }
    }
    response.redirect('http://localhost:3000/')

})

sessionRouter.get('/logout/:api', (request, response) => {

    const session = Session.findByKey(request.key)
    Session.removeApiToken(session, request.params.api)
    let responseContent = ''
    if (Session.hasActiveApis(session)) {
        console.log('if')
        responseContent = Session.responseForExistingSession(session)
    } else {
        console.log('else')
        Session.removeSession(session)
        responseContent = Session.responseForNewSession()
    }
    response.send(responseContent)

})

module.exports = sessionRouter