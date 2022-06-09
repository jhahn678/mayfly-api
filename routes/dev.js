const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Group = require('../models/group')
const Place = require('../models/place')
const Message = require('../models/message')
const Catch = require('../models/catch')
const { faker } = require('@faker-js/faker')
const generateAuthToken = require('../utils/generateAuthToken')
const dbseed = require('../utils/dbseed')

router.get('/', async (req, res) => {
    const users = await User.updateMany({}, {
        $set: { pending_contacts: [] }
    }, {new: true})

    res.status(200).json(users)
})

router.get('/token', async(req, res) => {
    const { user } = req.query;
    const token = await generateAuthToken({ _id: user })
    res.status(200).json(token)
})


router.post('/clear', async(req, res) => {
    await User.deleteMany({})
    await Group.deleteMany({})
    await Place.deleteMany({})
    await Message.deleteMany({})
    await Catch.deleteMany({})
})

router.post('/seed', async(req, res) => {
    await dbseed()
    res.status(200).json({ message: 'DB seeding complete'})
})


module.exports = router;