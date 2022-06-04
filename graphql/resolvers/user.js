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