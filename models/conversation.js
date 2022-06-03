const mongoose = require('mongoose')
const messageSchema = require('./message')

const conversationSchema = new mongoose.Schema({
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    messages: [messageSchema],
    latest_message: messageSchema,
    avatar: String,
    media: [String]
}, { timestamps: true })

module.exports = mongoose.model('Conversation', conversationSchema)