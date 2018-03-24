const jwt = require('jsonwebtoken')

exports.extractKeyFromRequest = (request, reponse, next) => {
    const state = request.query.state
    const authorization = request.get('authorization')
    if (state) {
        try {
            const decoded = jwt.verify(state, process.env.SECRET)
            request.key = decoded.key
        } catch (error) {
        }
    }
    if (authorization) {
        let key = ''
        try {
            key = jwt.verify(authorization, process.env.SECRET).key
            request.key = key
        } catch (error) {
        }
    }
    next()
}