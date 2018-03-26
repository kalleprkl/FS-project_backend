const dataRouter = require('express').Router()
const Session = require('../models/session')
const { models } = require('../config')

dataRouter.get('/:api', async (request, response) => {
    const key = request.key
    if (key) {
        const session = Session.findByKey(key)
        if (session) {
            const api = request.params.api
            const apiToken = session.getApiToken(api)
            if (apiToken) {
                const model = models[api]
                const data = await model.get(apiToken)
                if (data) {
                    return response.send(data)
                }
            }
        }
    }
    response.status(401).send()
})

module.exports = dataRouter