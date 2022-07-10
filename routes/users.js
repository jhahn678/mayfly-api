const express = require('express')
const router = express.Router()
const controller = require('../controllers/users')


router.get('/search', controller.searchUserByUsername)



module.exports = router;
