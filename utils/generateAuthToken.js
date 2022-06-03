const jwt = require('jsonwebtoken')

module.exports = generateAuthToken = (payload, expiresIn='90d') => {
    const token = jwt.sign(
        { ...payload },
        process.env.JWT_SECRET,
        { expiresIn: expiresIn }
    )
    return token;
}