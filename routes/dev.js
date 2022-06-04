const express = require('express')
const router = express.Router()
const User = require('../models/user')

router.get('/', async (req, res) => {
    const users = await User.updateMany({}, {
        $set: { pending_contacts: [] }
    }, {new: true})

    res.status(200).json(users)
})


module.exports = router;