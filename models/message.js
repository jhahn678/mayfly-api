const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    place: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place'
    },
    catch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Catch'
    },
    type: {
        type: String,
        enum: ['TEXT', 'MEDIA', 'PLACE', 'CATCH'],
        required: true
    },
    body: String,
    media: [{ id: String, url: String }]
}, { timestamps: true })

module.exports = mongoose.model('Message', messageSchema);