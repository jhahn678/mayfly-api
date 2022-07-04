const User = require('../../models/user')
const Group = require('../../models/group')
const Catch = require('../../models/catch')
const Place = require('../../models/place')
const AppError = require('../../utils/AppError')
const AuthError = require('../../utils/AuthError')

module.exports = {
    Query: {
        getUser: async (_, { userId }) => {
            const user = await User.findById(userId)
            if(!user) throw new AppError('User not found', 400)
            return user;
        },
        getUsers: async () => {
            const users = await User.find()
            return users;
        }
    },
    Mutation: {
        updateUser: async (_, { userUpdate }, { auth }) => {
            if(!auth._id) throw new AuthError(401, 'Not authenticated')
            let user = await User.findByIdAndUpdate(auth._id, {
                $set: { 
                    'details.firstName': userUpdate?.firstName,
                    'details.lastName': userUpdate?.lastName,
                    'details.bio': userUpdate?.bio,
                    'details.location': userUpdate?.location,
                    'details.avatar': userUpdate?.avatar
                }
            }, { new: true })
            if(userUpdate?.firstName || userUpdate?.lastName){
                user = await User.findByIdAndUpdate(auth._id, {
                    $set: { 'details.fullName': `${user.details.firstName} ${user.details.lastName}` }
                }, { new: true })
            }
            return user;
        },
        addContact: async (_, { userId }, { auth }) => {
            if(!auth._id) throw new AuthError(401)
            const user = await User.findByIdAndUpdate(auth._id, {
                $push: { contacts: userId }
            }, { new: true })
            return user.contacts;
        },
        requestContact: async (_, { userId }, { auth }) => {
            if(!auth._id) throw new AuthError(401)
            await User.findOneAndUpdate({ $and: [
                { _id: userId },
                { 'pending_contacts.user': { $ne: auth._id } }
            ]}, {
                $push: { pending_contacts: { user: auth._id, status: 'FROM', createdAt: new Date().toISOString() }}
            })
            const user = await User.findOneAndUpdate({ $and: [
                { _id: auth._id },
                { 'pending_contacts.user': { $ne: userId } }
            ]},{
                $push: { pending_contacts: { user: userId, status: 'TO', createdAt: new Date().toISOString() }}
            }, { new: true })
            if(!user) throw new AppError(400, 'User is already in your contacts')
            return user.pending_contacts;
        },
        cancelRequestContact: async (_, { userId }, { auth }) => {
            if(!auth._id) throw new AuthError(401)
            await User.findByIdAndUpdate(userId, {
                $pull: { pending_contacts: { user: auth._id, status: 'FROM' }}
            }, { new: true })
            const user = await User.findByIdAndUpdate(auth._id, {
                $pull: { pending_contacts: { user: userId, status: 'TO' }}
            }, { new: true })
            return user.pending_contacts
        },
        acceptContact: async (_, { userId }, { auth }) => {
            if(!auth._id) throw new AuthError(401)
            const user = await User.findOneAndUpdate({ $and : [
                { _id: auth._id }, 
                { pending_contacts : { $elemMatch: { user: userId, status: 'FROM' } } }
            ]}, {  
                $pull: { pending_contacts: { user : userId, status: 'FROM' } },
                $push: { contacts: userId }
            }, { new: true })
            await User.findByIdAndUpdate(userId, {
                $push: { contacts: auth._id },
                $pull: { pending_contacts: { user: auth._id, status: 'TO' }}
            })
            return user.contacts;
        },
        denyContact: async (_, { userId }, { auth }) => {
            if(!auth._id) throw new AuthError(401)
            const user = await User.findByIdAndUpdate(auth._id, {
                $pull: { pending_contacts: { user: userId, status: 'FROM' }}
            }, { new: true })
            await User.findByIdAndUpdate(userId, {
                $pull: { pending_contacts: { user: auth._id, status: 'TO'}}
            })
            return user.pending_contacts
        },
        removeContact: async (_, { userId }, { auth }) => {
            if(!auth._id) throw new AuthError(401)
            const user = await User.findByIdAndUpdate(auth._id, {
                $pull: { contacts: userId }
            }, { new: true })
            await User.findByIdAndUpdate(userId, {
                $pull: { contacts: auth._id }
            })
            return user.contacts;
        }
    },
    User: {
        groups: async ({ groups }) => {
            return (await Group.find({ _id: { $in: groups }}))
        },
        contacts: async ({ contacts }) => {
            return (await User.find({ _id: { $in: contacts }}))
        },
        catches: async ({ catches }) => {
            return (await Catch.find({ _id: { $in: catches }}))
        },
        places: async ({ places }) => {
            return (await Place.find({ _id: { $in: places }}))
        }
    }
}