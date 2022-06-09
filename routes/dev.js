const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Group = require('../models/group')
const Place = require('../models/place')
const Message = require('../models/message')
const Catch = require('../models/catch')
const { faker } = require('@faker-js/faker')
const generateAuthToken = require('../utils/generateAuthToken')

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

    await User.deleteMany({})
    await Group.deleteMany({})
    await Place.deleteMany({})
    await Message.deleteMany({})
    await Catch.deleteMany({})

    for(let i = 0; i < 20; i++){
        const user = new User({
            details: {
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                username: faker.internet.userName(),
            },
            account: {
                email: faker.internet.email(),
            }
        })
        await user.save()
    }

    const users = await User.find()

    const newGroup = new Group({
        users: users.map(u => u._id),
        name: 'Test group'
    })

    const group = await newGroup.save()

    for(let user of users){
        const filtered = users.filter(u => u._id !== user._id)

        const newMessage = new Message({
            user: user._id,
            group: group._id,
            type: 'TEXT',
            body: faker.lorem.words(10)
        })

        const message = await newMessage.save()

        const newPlace = new Place({
            name: faker.address.city(),
            description: faker.lorem.words(7),
            user: user._id,
            publish_type: 'PUBLIC',
            location: {
                type: 'Point',
                coordinates: [faker.address.longitude(), faker.address.latitude()]
            }
        })

        const place = await newPlace.save()

        const anotherPlace = new Place({
            name: faker.address.city(),
            description: faker.lorem.words(7),
            publish_type: 'SHARED',
            user: user._id,
            group: group._id,
            location: {
                type: 'Point',
                coordinates: [faker.address.longitude(), faker.address.latitude()]
            }
        })

        const place2 = await anotherPlace.save()

        await Group.findByIdAndUpdate(group._id, {
            $push: { places: place2._id, messages: message._id }
        })

        const places = [ place._id, place2._id ]

        const newCatch = new Catch({
            user: user._id,
            species: faker.animal.fish(),
        })

        const thisNewCatch = await newCatch.save()

        await User.findByIdAndUpdate(user._id, {
            $push: { 
                contacts: { $each: filtered },  
                groups: group._id,
                places: { $each: places },
                catches: thisNewCatch._id
            }
        })
    }

    res.status(200).json({ message: 'DB seeding complete'})

})


module.exports = router;