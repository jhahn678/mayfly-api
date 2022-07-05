const userResolvers = require('./user')
const groupResolvers = require('./group')
const messageResolvers = require('./message')
const placeResolvers = require('./place')
const catchResolvers = require('./catch')
const { DateTimeResolver } = require('graphql-scalars')

module.exports = {
    Query: {
        ...userResolvers.Query,
        ...groupResolvers.Query,
        ...messageResolvers.Query,
        ...placeResolvers.Query,
        ...catchResolvers.Query
    },
    Mutation: {
        ...userResolvers.Mutation,
        ...groupResolvers.Mutation,
        ...messageResolvers.Mutation,
        ...placeResolvers.Mutation,
        ...catchResolvers.Mutation
    },
    Subscription: {
        ...messageResolvers.Subscription
    },
    User: { ...userResolvers.User },
    Group: { ...groupResolvers.Group },
    Message: { ...messageResolvers.Message },
    Place: { ...placeResolvers.Place },
    Catch: { ...catchResolvers.Catch },
    DateTime: DateTimeResolver
}