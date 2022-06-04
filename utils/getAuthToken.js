const jwt = require('jsonwebtoken')
const AuthError = require('../utils/AppError')

const getAuthToken = async (header) => {
    if(!header) return;
    const token = header.split(' ')[1]
    const payload = await jwt.verify(token, process.env.JWT_SECRET)
    if(!payload) throw new AuthError(401)
    return payload;
}

module.exports = getAuthToken;