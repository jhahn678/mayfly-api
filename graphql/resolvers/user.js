const User = require('../../models/user')
const Conversation = require('../../models/conversation')
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
        addContact: async (_, { userId}, { auth }) => {
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
                $push: { pending_contacts: { user: auth._id, status: 'FROM', createdAt: Date.now() }}
            })
            const user = await User.findOneAndUpdate({ $and: [
                { _id: auth._id },
                { 'pending_contacts.user': { $ne: auth._id } }
            ]},{
                $push: { pending_contacts: { user: userId, status: 'TO', createdAt: Date.now() }}
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
            return user.contacts;
        }
    },
    User: {
        conversations: async ({ conversations }) => {
            return (await Conversation.find({ _id: { $in: conversations }}))
        },
        contacts: async ({ contacts }) => {
            return (await User.find({ _id: { $in: contacts }}))
        }
    }
}