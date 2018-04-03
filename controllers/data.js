const dataRouter = require('express').Router()
const Session = require('../models/session')
const { models } = require('../utils/config/data')

dataRouter.get('/:api', async (request, response) => {
    const session = Session.findByKey(request.key)
    if (session) {
        const api = request.params.api
        const apiToken = session.getApiToken(api)
        console.log('DATA', apiToken)
        if (apiToken) {
            const model = models[api]
            const data = await model.getContent(apiToken)
            if (data) {
                return response.send(data)
            }
        }
    }
    response.status(401).send()
})

module.exports = dataRouter