const mongoose = require('mongoose')

const catchSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    place: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place'
    },
    species: String,
    length: {
        value: Number,
        unit: {
            type: String,
            enum: ['IN', 'CM']
        }
    },
    weight: {
        value: Number,
        unit: {
            type: String,
            enum: ['LB', 'OZ', 'KG', 'G']
        }
    },
    rig: String,
    media: [{ id: String, url: String }]
}, { timestamps: true })

module.exports = mongoose.model('Catch', catchSchema)