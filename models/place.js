const mongoose = require('mongoose')

const placeSchema = new mongoose.Schema({
    name: String,
    description: String,
    avatar: { 
      id: String, 
      url: String 
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    publish_type: {
        type: String,
        enum: ['PUBLIC', 'SHARED', 'PRIVATE']
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    catches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Catch'
      }
    ],
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
    media: [{ id: String, url: String }]
}, { timestamps: true });

module.exports = mongoose.model('Place', placeSchema)