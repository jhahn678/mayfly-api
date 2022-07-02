const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const AuthError = require('../utils/AuthError')
const generateAuthToken = require('../utils/generateAuthToken')
const catchAsync = require('../utils/catchAsync')
const { OAuth2Client } = require('google-auth-library')
const axios = require('axios')


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

router.post('/register', catchAsync(async(req, res) => {
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
    res.json({ 
        token, 
        user: { ...user.details, _id: user._id },
        message: 'User created successfully'
    }).status(200)
}))

router.get('/username', catchAsync(async(req, res) => {
    const { value } = req.query
    const user = await User.findOne({ 'details.username': value })
    if(user) return res.status(400).json({ message: 'Username already in use' })
    res.status(200).json({ message: 'Username Available'})
}))

router.get('/email', catchAsync(async(req, res) => {
    const { value } = req.query;
    const user = await User.findOne({ 'account.email': value })
    if(user) return res.status(400).json({ message: 'Email already in use' })
    res.status(200).json({ message: 'Email Available'})
}))


router.post('/google', catchAsync(async(req, res) => {
    const { token } = req.body;
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: [process.env.GOOGLE_CLIENT_ID_EXPO]
    })
    const payload = ticket.getPayload()
    const user = await User.findOne({ 'account.googleId': payload.sub })
    if(user){
        const token = generateAuthToken({ _id: user._id})
        return res.status(200).json({ 
            token, 
            user: { ...user.details, _id: user._id },
            message: 'Authentication successful' 
        })
    }else{
        const newUser = new User({
            details: {
                firstName: payload.given_name,
                lastName: payload.family_name,
                fullName: payload.name,
                avatar: {
                    url: payload.picture
                }
            },
            account: {
                email: payload.email.toLowerCase(),
                googleId: payload.sub
            }
        })
        const savedUser = await newUser.save()
        const token = generateAuthToken({ _id: savedUser._id})
        return res.status(200).json({ 
            token, 
            user: { ...savedUser.details, _id: savedUser._id },
            message: 'User created successfully' 
        })
    }
}))



router.post('/facebook', catchAsync(async(req, res) => {
    const { token } = req.body;

    const response = await axios({ 
        url: 'https://graph.facebook.com/me',
        method: 'get',
        params: {
            fields: ['id', 'email', 'first_name', 'last_name', 'picture'].join(','),
            access_token: token
        }
    })

    const { id, email, first_name, last_name, picture } = response.data;
    const user = await User.findOne({ 'account.facebookId': id })

    if(user){
        const token = generateAuthToken({ _id: user._id})
        return res.status(200).json({ 
            token, 
            user: { ...user.details, _id: user._id },
            message: 'Authentication successful' 
        })
    }else{
        const newUser = new User({
            details: {
                firstName: first_name,
                lastName: last_name,
                fullName: `${first_name} ${last_name}`,
                avatar: {
                    url: picture.data.url
                }
            },
            account: {
                email: email.toLowerCase(),
                facebookId: id
            }
        })
        const savedUser = await newUser.save()
        const token = generateAuthToken({ _id: savedUser._id})
        return res.status(200).json({ 
            token, 
            user: { ...savedUser.details, _id: savedUser._id },
            message: 'User created successfully' 
        })
    }
    
}))

module.exports = router;




// curl -X GET 'https://graph.facebook.com/debug_token?input_token=EAAPVzjFyExMBAPzbqkWKt1mouEZAT11SgaCRCSZAB79utmHxaUeWojPh6QCkbMGPYmzF7K8cbJn8yX1sGFHVw7iXGNkzVY7qo17ZBIp4pmZAGYYjRORpwRZBo1GaDQipbRB0ZAgnB60rIXq2KT9i0Y6UxnlGCraIgZB4OQzhHizYjo7c6kiMNvw&access_token=1079506499670803|RF7HnqxAAb7WNx4lWPnKDxqw5lQ'