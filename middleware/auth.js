const jwt = require('jsonwebtoken')

exports.checkToken = (request, reponse, next) => {
    //console.log(request.url)
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
        try {
            const decoded = jwt.verify(authorization, process.env.SECRET)

            request.key = decoded.key
        } catch (error) {
        }
    }
    next()
}