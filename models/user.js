const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    details: {
        firstName: String,
        lastName: String,
        fullName: String,
        username: {
            type: String,
            unique: true,
            sparse: true
        },
        avatar: { 
            id: String, 
            url: String 
        },
        bio: String,
        location: String,
    },
    account: {
        email: String,
        googleId: {
            type: String,
            unique: true,
            sparse: true
        },
        facebookId: {
            type: String,
            unique: true,
            sparse: true
        },
        phone: Number,
        password: String
    },
    groups: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group'
        }
    ],
    contacts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    pending_contacts: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            status: {
                type: String,
                enum: ['TO', 'FROM']
            },
            createdAt: Date
        }
    ],
    places: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Place'
        }
    ],
    catches: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Catch'
        }
    ]
}, { timestamps: true })


module.exports = mongoose.model('User', userSchema)