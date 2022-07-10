const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')


const searchUserByUsername = catchAsync(async(req, res) => {
    const { value } = req.query;
    const users = await User
        .find({ 'details.username': { $regex: `^${value}`, $options: 'i' } })
        .limit(4).select({ details: { fullName: 1, username: 1, avatar: { url: 1 } }})
    return res.status(200).json(users)
})

module.exports = { 
    searchUserByUsername
}

