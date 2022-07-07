const User = require('../../models/user')
const Catch = require('../../models/catch')
const Group = require('../../models/group')
const Place = require('../../models/place')
const AppError = require('../../utils/AppError')
const AuthError = require('../../utils/AuthError')

module.exports = {
    Query: {
        getCatch: async (_, { catchId }, { auth }) => {
            const catchDoc = await Catch.findById(catchId)
            if(!catchDoc) throw new AppError('Resource not found', 400)
            if(auth._id === catchDoc.user || catchDoc.publish_type === 'PUBLIC') return catchDoc
            if(catchDoc.publish_type === 'PRIVATE') throw new AuthError(403, 'Unauthorized -- Resource is private')
            if(catchDoc.publish_type === 'SHARED'){
                const user = await User.findById(auth._id)
                if(!user.groups.includes(catchDoc.group)){
                    throw new AuthError(403, 'Unauthorized -- Requesting user is not in group')
                }
                return catchDoc;
            }
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
            if(catchInput.place) ( await Place.findByIdAndUpdate(catchInput.place, {
                $push: { catches: savedCatch._id }
            }))
            if(catchInput.group) ( await Group.findByIdAndUpdate(catchInput.group, {
                $push: { catches: savedCatch._id}
            }))
            return user.catches;
        },
        updateCatch: async (_, { catchId, catchUpdate}, { auth }) => {
            if(!auth._id) throw new AuthError(401, 'Not authenticated')
            const catchDoc = await Catch.findById(catchId)
            if(catchDoc.user.toString() !== auth._id) throw new AuthError(403, 'Not authorized')
            if(catchUpdate?.place !== undefined){
                if(catchDoc.place){
                    await Place.findByIdAndUpdate(catchDoc.place, {
                        $pull: { catches: catchId }
                    })
                }
                await Place.findByIdAndUpdate(catchUpdate.place, {
                    $push: { catches: catchId }
                })
            }
            const updatedCatch = await Catch.findOneAndUpdate({ $and : [
                { _id: catchId }, { user: auth._id }
            ]}, {
                $set: { ...catchUpdate }
            }, { new: true })
            return updatedCatch;
        },
        deleteCatch: async (_, { catchId }, { auth }) => {
            if(!auth._id) throw new AuthError(401, 'Not authenticated')
            const catchDoc = await Catch.findById(catchId)
            if(auth._id !== catchDoc.user.toString()) throw new AuthError(403, 'Not authorized')
            const user = await User.findByIdAndUpdate(auth._id, {
                $pull: { catches: catchId }
            }, { new: true })
            await Place.findByIdAndUpdate(catchDoc.place, {
                $pull: { catches: catchId }
            })
            await Group.findOneAndUpdate({ catches: catchId }, {
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