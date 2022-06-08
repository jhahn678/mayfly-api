const User = require('../../models/user')
const Catch = require('../../models/catch')
const Place = require('../../models/place')
const AppError = require('../../utils/AppError')
const AuthError = require('../../utils/AuthError')

module.exports = {
    Query: {
        getCatch: async (_, { catchId }) => {
            const catchDoc = await Catch.findById(catchId)
            if(!catchDoc) throw new AppError('Resource not found', 400)
            return catchDoc;
        }
    },
    Mutation: {
        createCatch: async (_, { catchInput }, { auth }) => {
            if(!auth._id) throw new AuthError(401, 'Not authenticated')
            const newCatch = new Catch({
                user: auth._id,
                ...catchInput
            })
            const savedCatch = await newCatch.save()
            const user = await User.findByIdAndUpdate(auth._id, {
                $push: { catches: savedCatch._id } 
            }, { new: true })
            if(catchInput.place) await Places.findByIdAndUpdate(catchInput.place, {
                $push: { catches: savedCatch._id }
            })
            return user.catches;
        },
        updateCatch: async (_, { catchId, catchUpdate}, { auth }) => {
            if(!auth._id) throw new AuthError(401, 'Not authenticated')
            const updatedCatch = await Catch.findByOneAndUpdate({ $and : [
                { _id: catchId }, { user: auth._id }
            ]}, {
                $set: { ...catchUpdate }
            }, { new: true })
            return updatedCatch;
        },
        deleteCatch: async (_, { catchId }, { auth }) => {
            if(!auth._id) throw new AuthError(401, 'Not authenticated')
            const catchDoc = await Catch.findById(catchId)
            if(auth._id !== catchDoc.user) throw new AuthError(403, 'Not authorized')
            const user = await User.findByIdAndUpdate(auth._id, {
                $pull: { catches: catchId }
            }, { new: true })
            const place = await Place.findByIdAndUpdate(catchDoc.place, {
                $pull: { catches: catchId }
            })
            return user.catches;
        }
    },
    Catch: {
        user: async ({ user }) => {
            return (await User.findById(user))
        },
        place: async ({ place }) => {
            return (await Place.findById(place))
        }
    }
}