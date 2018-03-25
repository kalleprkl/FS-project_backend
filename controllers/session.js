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

sessionRouter.get('/:api', (request, response) => {
    Session.getAuthorization(request.params.api, request.key, request.query.code)
    response.redirect('http://localhost:3000/')
})

sessionRouter.get('/logout/:api', (request, response) => {
    const responseContent = Session.logout(request.params.api, request.key)
    response.send(responseContent)
})

module.exports = sessionRouter