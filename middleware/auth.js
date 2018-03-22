const jwt = require('jsonwebtoken')
require('dotenv').config() 

const tokenExtractor = (request, response, next) => {
    
    if (!request.token) {
        const authorization = request.get('authorization')
        if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
            request.token = authorization.substring(7)
        }
    }
    next()
}

exports.checkToken = (request, reponse, next) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        const token = authorization.substring(7)
        const key = jwt.verify(token, process.env.SECRET)
        if (key) {
            request.key = key
        }
    }
    next()
}