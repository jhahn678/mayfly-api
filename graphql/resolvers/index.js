const userResolvers = require('./user')
const groupResolvers = require('./group')
const messageResolvers = require('./message')

module.exports = {
    Query: {
        ...userResolvers.Query,
        ...groupResolvers.Query,
        ...messageResolvers.Query
    },
    Mutation: {
        ...userResolvers.Mutation,
        ...groupResolvers.Mutation,
        ...messageResolvers.Mutation
    },
    User: { ...userResolvers.User },
    Group: { ...groupResolvers.Group },
    Message: { ...messageResolvers.Message }
}