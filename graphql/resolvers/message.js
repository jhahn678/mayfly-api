const User = require('../../models/user')
const Group = require('../../models/group')
const Message = require('../../models/message')
const AuthError = require('../../utils/AuthError')

module.exports = {
    Query: { 
        getMessage: async (_, { messageId }) => {
            return (await Message.findById(messageId))
        }
    },
    Mutation: {
        createMessage: async (_, { groupInput }, { auth }) => {
            if(!auth._id) throw new AuthError(401)
            const newMessage = new Message({ 
                user: auth._id, 
                group: groupInput.group, 
                body: groupInput.body,
                media: groupInput.media,
                catch: groupInput.catch,
                place: groupInput.place
            })
            const message = await newMessage.save()
            await Group.findOneAndUpdate({ $and: [
                { _id: groupId }, { users: auth._id }
            ]}, { 
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
        group: async ({ group }) => {
            return (await Group.findById(group))
        }
    }
}