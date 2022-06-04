const userResolvers = require('./user')
const conversationResolvers = require('./conversation')
const messageResolvers = require('./message')

module.exports = {
    Query: {
        ...userResolvers.Query,
        ...conversationResolvers.Query,
        ...messageResolvers.Query
    },
    Mutation: {
        ...userResolvers.Mutation,
        ...conversationResolvers.Mutation,
        ...messageResolvers.Mutation
    },
    User: { ...userResolvers.User },
    Conversation: { ...conversationResolvers.Conversation },
    Message: { ...messageResolvers.Message }
}