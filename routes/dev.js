const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Group = require('../models/group')
const Place = require('../models/place')
const Message = require('../models/message')
const Catch = require('../models/catch')
const { faker } = require('@faker-js/faker')
const generateAuthToken = require('../utils/generateAuthToken')
const { seedDatabaseForAppTesting } = require('../utils/dbseed')
const {Client} = require('@googlemaps/google-maps-services-js')


router.get('/token', async(req, res) => {
    const { user } = req.query;
    const token = await generateAuthToken({ _id: user })
    res.status(200).json(token)
})

router.post('/seed', async(req, res) => {
    await seedDatabaseForAppTesting()
    res.status(200).json({ message: 'DB seeding complete'})
})

router.post('/test-geocode', async(req, res) => {
    const { latitude, longitude } = req.body
    const client = new Client({})
    const { data } = await client.reverseGeocode({ params: {
        key: process.env.GOOGLE_API_KEY,
        latlng: { 
            latitude: latitude,
            longitude: longitude
        },
        result_type: 'administrative_area_level_2|locality|sublocality'
    }})
    res.status(200).json(data.results[0])
})



module.exports = router;

