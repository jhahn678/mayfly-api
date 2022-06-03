const { gql } = require('apollo-server-express')

module.exports = typeDefs = gql `
    type User {
        _id: ID!,
        details: UserDetails,
        account: UserAccount,
        conversations: [ID],
        friends: [ID],
        createdAt: String,
        updatedAt: String   
    }

    type UserDetails {
        firstName: String,
        lastName: String,
        fullName: String
    }

    type UserAccount {
        email: String,
        phone: Int,
        password: String
    }

    type Conversation {
        _id: ID!,
        users: [ID],
        messages: [ID],
        latest_message: Message,
        avatar: String
    }

    type Message {
        _id: ID!,
        user: ID,
        body: String,
        media: [String]
        createdAt: String
    }

    type Query {
        getUserConversations(userId: ID): [Conversation]
        getConversationMessages(converstationId: ID): [Message]
        getUser(userId: ID): User
        getAllUsers: [User]
    }

    type Mutation {
        createMessage(conversationId: ID, body: String): Message
        createConversation(users: [ID]): Conversation
    }
`