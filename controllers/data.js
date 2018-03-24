const dataRouter = require('express').Router()
const { sessions } = require('../sessions')

const models = {
    youtube: require('../models/youtube'),
    reddit: require('../models/reddit')
}

dataRouter.get('/:api', async (request, response) => {
    const key = request.key
    if (key) {
        const api = request.params.api 
        const model = models[api]
        const sessionApis = sessions[key]
        const apiToken = sessionApis[api]
        const data = await model.get(apiToken)
        return response.send(data)
    }
    response.status(401).send()
})

module.exports = dataRouter