const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    details: {
        firstName: String,
        lastName: String,
        fullName: String,
        username: {
            type: String,
            unique: true
        },
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
    contacts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)