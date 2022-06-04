const { gql } = require('apollo-server-express')

module.exports = typeDefs = gql `
    type User {
        _id: ID!,
        details: UserDetails,
        account: UserAccount,
        conversations: [Conversation],
        contacts: [User],
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
        users: [User],
        messages: [Message],
        latest_message: Message,
        avatar: String
    }

    type Message {
        _id: ID!,
        user: User!,
        body: String,
        media: [String]
        createdAt: String
    }

    type Query {
        getUser(userId: ID): User
        getUsers: [User]
        getConversation(conversationId: ID): Conversation
        getConversations: [Conversation]
        getMessage(messageId: ID): Message
    }

    type Mutation {
        createMessage(conversationId: ID, body: String): Message
        createConversation(users: [ID]): Conversation
        leaveConversation(conversationId: ID): [Conversation]
        addContact(userId: ID): [User]
        removeContact(userId: ID): [User]
    }
`