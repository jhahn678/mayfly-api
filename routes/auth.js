const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const AuthError = require('../utils/AuthError')
const generateAuthToken = require('../utils/generateAuthToken')
const catchAsync = require('../utils/catchAsync')

router.post('/login', catchAsync(async(req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ 'account.email': email.toLowerCase() })
    if(user && (await bcrypt.compare(password, user.account.password))){
        const token = generateAuthToken({ _id: user._id})
        return res.status(200).json({ 
            token, 
            user: { ...user.details, _id: user._id },
            message: 'Authentication successful' 
        })
    }else{
        throw new AuthError(401, 'Invalid credentials')
    }
}))

router.post('/register', async(req, res) => {
    const { firstName, lastName, email, username, password } = req.body;
    const registeredUser = await User.findOne({ 'account.email': email.toLowerCase() })
    if(registeredUser) throw new AuthError(400, 'Email already in use')
    const hash = await bcrypt.hash(password, 10)
    const newUser = new User({
        details: {
            firstName: firstName,
            lastName: lastName,
            fullName: `${firstName} ${lastName}`,
            username: username
        },
        account: {
            email: email.toLowerCase(),
            password: hash
        }
    })
    const user = await newUser.save()
    const token = generateAuthToken({ _id: user._id })
    res.json({ user, token, message: 'User created successfully' }).status(200)
})

module.exports = router;