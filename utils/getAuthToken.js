const jwt = require('jsonwebtoken')
const AuthError = require('../utils/AppError')

const getAuthToken = (header) => {
    const token = header.split(' ')[1]
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    if(!payload) throw new AuthError(401)
    return payload;
}

module.exports = getAuthToken;