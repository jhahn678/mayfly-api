const express = require('express')
const router = express.Router()
const controller = require('../controllers/auth')


router.post('/login', controller.loginWithEmail)

router.post('/register', controller.registerWithEmail)

router.patch('/register/username', controller.registerUsername)

router.get('/email', controller.validateUniqueEmail)

router.get('/username', controller.validateUniqueUsername)

router.post('/google', controller.loginWithGoogle)

router.post('/facebook', controller.loginWithFacebook)

router.get('/me', controller.getMyDetails)



module.exports = router;