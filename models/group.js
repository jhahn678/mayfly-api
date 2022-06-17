const mongoose = require('mongoose')

const groupSchema = new mongoose.Schema({
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message'
        }
    ],
    latest_message: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
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
    ],
    avatar: {
        id: String,
        url: String
    },
    name: String,
    media: [{ id: String, url: String }],
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true })

module.exports = mongoose.model('Group', groupSchema)