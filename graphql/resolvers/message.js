const User = require('../../models/user')
const Conversation = require('../../models/conversation')
const Message = require('../../models/message')
const AuthError = require('../../utils/AuthError')

module.exports = {
    Query: { 
        getMessage: async (_, { messageId }) => {
            return (await Message.findById(messageId))
        }
    },
    Mutation: {
        createMessage: async (_, { conversationId, body }, { auth }) => {
            if(!auth._id) throw new AuthError(401)
            const newMessage = new Message({ user: auth._id, conversation: conversationId, body})
            const message = await newMessage.save()
            await Conversation.findByIdAndUpdate(conversationId, { 
                $push: { messages: message._id },
                $set: { latest_message: message._id }
            })
            return message;
        }
    },
    Message: {
        user: async ({ user }) => {
            return (await User.findById(user))
        },
        conversation: async ({ conversation }) => {
            return (await Conversation.findById(conversation))
        }
    }
}