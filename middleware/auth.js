const jwt = require('jsonwebtoken')
require('dotenv').config()

exports.checkToken = (request, reponse, next) => {
    const state = request.query.state
    const authorization = request.get('authorization')
    if (state) {
        try {
            request.key = jwt.verify(state, process.env.SECRET).key
        } catch (error) {
        }
    }
    if (authorization) {
        try {
            request.key = jwt.verify(authorization, process.env.SECRET).key
        } catch (error) {
        }
    }
    next()
}