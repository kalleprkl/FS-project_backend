const dataRouter = require('express').Router()
const { sessions } = require('../sessions')
const { models } = require('../config')

dataRouter.get('/:api', async (request, response) => {
    const key = request.key
    if (key) {
        try {
            const api = request.params.api
            const model = models[api]
            const sessionApis = sessions[key]
            const apiToken = sessionApis[api]
            const data = await model.get(apiToken)
            return response.send(data)
        } catch (error) {

        }
    }
    response.status(401).send()
})

module.exports = dataRouter