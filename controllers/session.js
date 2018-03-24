const { getAuthorization, logout, processInitialQuery } = require('../helpers/session')
const sessionRouter = require('express').Router()

sessionRouter.get('/', (request, response) => {
    const responseContent = processInitialQuery(request)
    response.send(responseContent)
})

sessionRouter.get('/:api', (request, response) => {
    getAuthorization(request)
    response.redirect('http://localhost:3000/')
})

sessionRouter.get('/logout/:api', (request, response) => {
    logout(request)
    response.send()
})

module.exports = sessionRouter