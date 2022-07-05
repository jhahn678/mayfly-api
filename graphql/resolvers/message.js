const User = require('../../models/user')
const Group = require('../../models/group')
const Message = require('../../models/message')
const AuthError = require('../../utils/AuthError')
const { PubSub, withFilter } = require('graphql-subscriptions')

const pubsub = new PubSub()

module.exports = {
    Query: { 
        getMessage: async (_, { messageId }) => {
            return (await Message.findById(messageId))
        }
    },
    Mutation: {
        createMessage: async (_, { messageInput }, { auth }) => {

            if(!auth._id) throw new AuthError(401)

            const newMessage = new Message({ 
                user: auth._id, 
                group: messageInput.group, 
                body: messageInput.body,
                media: messageInput.media,
                catch: messageInput.catch,
                place: messageInput.place,
                type: messageInput.type
            })

            const message = await newMessage.save()

            pubsub.publish('MESSAGE_CREATED', message)

            await Group.findOneAndUpdate({ $and: [
                { _id: messageInput.group }, { users: auth._id }
            ]}, { 
                $push: { messages: message._id },
                $set: { latest_message: message._id }
            })

            return message;
        }
    },
    Subscription: {
        messageCreated: {
            subscribe: withFilter(
                () => pubsub.asyncIterator(['MESSAGE_CREATED']),
                (payload, variables) => {
                    return (payload.messageCreated.group === variables.groupId )
                }
            )
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