const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    details: {
        firstName: String,
        lastName: String,
        fullName: String,
        avatar: String
    },
    account: {
        email: String,
        phone: Number,
        password: String
    },
    conversations: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conversation'
        }
    ],
    friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)