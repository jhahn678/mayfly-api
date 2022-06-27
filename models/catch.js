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
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    publish_type: {
        type: String,
        enum: ['PUBLIC', 'SHARED', 'PRIVATE']
    },
    title: String,
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