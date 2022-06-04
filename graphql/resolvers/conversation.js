const User = require('../../models/user')
const Message = require('../../models/message')
const Conversation = require('../../models/conversation')
const AuthError = require('../../utils/AuthError')

module.exports = {
    Query: {
        getConversation: async (conversationId) => {
            return (await Conversation.findOne({ _id: conversationId}))
        },
        getConversations: async () => {
            return (await Conversation.find())
        }
    },
    Mutation: {
        createConversation: async (_, { users }, { auth }) => {
            if(!auth._id) throw new AuthError(401)
            const allUsers = users.concat(auth._id)
            const newConversation = new Conversation({ users: allUsers })
            const conversation = await newConversation.save()
            await User.updateMany({ _id: { $in: allUsers }}, {
                $push: { conversations: conversation._id }
            })
            return conversation;
        },
        leaveConversation: async (_, { conversationId }, { auth }) => {
            if(!auth._id) throw new AuthError(401)
            const user = await User.findByIdAndUpdate(auth._id, {
                $pull: { conversations: conversationId }
            }, { new: true })
            await Conversation.findByIdAndUpdate(conversationId, { 
                $pull: { users: auth._id }
            })
            return user.conversations
        } 
    },
    Conversation: {
        users: async ({ users }) => {
            return (await User.find({ _id: { $in: users } }))
        },
        messages: async ({ messages }) => {
            return (await Message.find({ _id: { $in: messages }}))
        },
        latest_message: async ({ latest_message }) => {
            return (await Message.findById(latest_message))
        }
    }
}