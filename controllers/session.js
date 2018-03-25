const { getAuthorization, logout, processInitialQuery } = require('../helpers/session')
const sessionRouter = require('express').Router()

sessionRouter.get('/', (request, response) => {
    const responseContent = processInitialQuery(request.key)
    response.send(responseContent)
})

sessionRouter.get('/:api', (request, response) => {
    getAuthorization(request.params.api, request.key, request.query.code)
    response.redirect('http://localhost:3000/')
})

sessionRouter.get('/logout/:api', (request, response) => {
    const responseContent = logout(request.params.api, request.key)
    response.send(responseContent)
})

module.exports = sessionRouter