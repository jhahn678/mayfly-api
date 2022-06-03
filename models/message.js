const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    body: String,
    media: [String]
}, { timestamps: true })

module.exports = messageSchema;