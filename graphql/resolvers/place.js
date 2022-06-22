const User = require('../../models/user')
const Catch = require('../../models/catch')
const Place = require('../../models/place')
const Group = require('../../models/group')
const AuthError = require('../../utils/AuthError')
const { Client } = require('@googlemaps/google-maps-services-js')

module.exports = {
    Query: {
        getPlace: async (_, { placeId } ) => {
            console.log(placeId)
            return (await Place.findById(placeId))
        },
        getPlaces: async () => {
            return (await Place.find({ publish_type: 'PUBLIC' }))
        }
    },
    Mutation: {
        createPlace: async (_, { placeInput }, { auth }) => {
            if(!auth._id) throw new AuthError(401, 'Not authenticated')
            const client = new Client({})
            const { data } = await client.reverseGeocode({ params: {
                key: process.env.GOOGLE_API_KEY,
                latlng: { 
                    latitude: placeInput.coordinates[1],
                    longitude: placeInput.coordinates[0]
                },
                result_type: 'administrative_area_level_2'
            }})
            const newPlace = new Place({
                name: placeInput.name,
                description: placeInput.description,
                avatar: placeInput.avatar,
                user: auth._id,
                publish_type: placeInput.publish_type,
                group: placeInput.group,
                locality: data.results[0].formatted_address,
                location: {
                    type: 'Point',
                    coordinates: placeInput.coordinates
                }
            })
            const place = await newPlace.save()
            await User.findByIdAndUpdate(auth._id, {
                $push: { places: place._id }
            })
            if(placeInput.group) ( await Group.findByIdAndUpdate(placeInput.group, {
                $push: { places: place._id }
            }))
            return place;
        },
        updatePlace: async (_, { placeId, placeUpdate }, { auth }) => {
            if(!auth._id) throw new AuthError(401, 'Not authenticated')
            const place = await Place.findById(placeId)
            if(place.user.valueOf() !== auth._id.valueOf()) throw new AuthError(403, 'Not authorized')
            const placeUpdated = await Place.findByIdAndUpdate(placeId, {
                $set: { ...placeUpdate }
            }, { new: true })
            return placeUpdated;
        },
        deletePlace: async (_, { placeId }, { auth }) => {
            if(!auth._id) throw new AuthError(401, 'Not authenticated')
            const place = await Place.findById(placeId)
            if(place.user.toString() !== auth._id) throw new AuthError(403, 'Not authorized')
            const user = await User.findByIdAndUpdate(auth._id, {
                $pull: { places: placeId }
            }, { new: true })
            if(place.group){
                await Group.findByIdAndUpdate(place.group, {
                    $pull: { places: placeId }
            })}
            await Place.findByIdAndDelete(placeId)
            return user.places;
        }
    },
    Place: {
        user: async ({ user }) => {
            return (await User.findById(user))
        },
        group: async ({ group }) => {
            return (await Group.findById(group))
        },
        catches: async ({ catches }) => {
            return (await Catch.find({ _id: { $in: catches } }))
        }
    }
}