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
        pending_contacts: [PendingContact]
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

    type PendingContact {
        user: User!,
        status: Status,
        createdAt: Int!
    }

    enum Status {
        TO
        FROM
    }

    type Conversation {
        _id: ID!,
        users: [User],
        messages: [Message],
        latest_message: Message,
        avatar: String,
        name: String,
        media: [String]
    }

    type Message {
        _id: ID!,
        user: User!,
        conversation: Conversation!
        body: String,
        media: [String],
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
        requestContact(userId: ID): [PendingContact]
        acceptContact(userId: ID): [User]
        denyContact(userId: ID): [PendingContact]
        removeContact(userId: ID): [User]
    }
`