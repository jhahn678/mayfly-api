const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const AppError = require('../utils/AppError')
const generateAuthToken = require('../utils/generateAuthToken')

router.post('/login', async(req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ 'account.email': email })
    if(await bcrypt.compare(password, user.account.password)){
        const token = generateAuthToken({ _id: user._id})
        return res.json({ token, message: 'Authentication successful' }).status(200)
    }else{
        throw new AppError('Invalid credentials', 401)
    }
})

router.post('/register', async(req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const registeredUser = await User.findOne({ 'account.email': email })
    if(registeredUser) throw new AppError('Email already in use', 400)
    const hash = await bcrypt.hash(password, 10)
    const newUser = new User({
        details: {
            firstName: firstName,
            lastName: lastName,
            fullName: `${firstName} ${lastName}`
        },
        account: {
            email: email,
            password: hash
        }
    })
    const user = await newUser.save()
    const token = generateAuthToken({ _id: user._id })
    res.json({ user, token, message: 'User created successfully' }).status(200)
})

module.exports = router;