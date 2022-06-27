const { gql } = require('apollo-server-express')

module.exports = typeDefs = gql `
    type User {
        _id: ID,
        details: UserDetails,
        account: UserAccount,
        groups: [Group],
        contacts: [User],
        pending_contacts: [PendingContact],
        places: [Place],
        catches: [Catch],
        createdAt: String,
        updatedAt: String
    }

    type UserDetails {
        firstName: String,
        lastName: String,
        fullName: String,
        username: String,
        avatar: Media,
        bio: String,
        location: String
    }

    type UserAccount {
        email: String,
        phone: Int,
        googleId: ID,
        facebookId: ID,
        password: String
    }

    type PendingContact {
        user: User!,
        status: Status,
        createdAt: Float!
    }

    enum Status {
        TO
        FROM
    }



    type Place {
        _id: ID,
        name: String,
        description: String,
        avatar: Media,
        user: User,
        publish_type: PublishType!,
        group: Group,
        catches: [Catch],
        locality: String,
        location: Location,
        media: [Media]
        createdAt: String
    }

    type Location {
        type: String,
        coordinates: [Float]!
    }

    enum PublishType {
        PUBLIC
        SHARED
        PRIVATE
    }



    type Catch {
        _id: ID,
        user: User,
        place: Place,
        publish_type: PublishType!,
        title: String,
        species: String,
        length: Length,
        weight: Weight,
        rig: String,
        media: [Media]
        createdAt: String,
    }

    type Length {
        value: Float!,
        unit: LengthUnit!
    }
    
    enum LengthUnit{
        IN
        CM
    }

    type Weight {
        value: Float!,
        unit: WeightUnit!
    }

    enum WeightUnit {
        LB
        OZ
        KG
        G
    }



    type Group {
        _id: ID,
        users: [User],
        messages: [Message],
        latest_message: Message,
        places: [Place],
        catches: [Catch]
        avatar: Media,
        name: String,
        media: [Media],
        createdAt: String,
        created_by: User!
    }


    type Message {
        _id: ID!,
        user: User!,
        group: Group!,
        place: Place,
        catch: Catch,
        type: MessageType,
        body: String,
        media: [Media],
        createdAt: String
    }

    type Media {
        id: ID!,
        url: String
    }

    enum MessageType {
        TEXT
        MEDIA
        PLACE
        CATCH
    }


    type Query {
        getUser(userId: ID!): User
        getUsers: [User]
        getGroup(groupId: ID!): Group
        getGroups: [Group]
        getMessage(messageId: ID!): Message
        getPlace(placeId: ID!): Place
        getPlaces: [Place]
        getCatch(catchId: ID!): Catch
    }

    type Mutation {
        updateUser(userUpdate: UserUpdate): User
        createMessage(messageInput: MessageInput): Message
        createGroup(groupInput: GroupInput): Group
        updateGroup(groupId: ID!, groupUpdate: GroupUpdate): Group
        addUsersToGroup(users:[ID], groupId: ID): Group
        leaveGroup(groupId: ID): [Group]
        addContact(userId: ID): [User]
        requestContact(userId: ID): [PendingContact]
        cancelRequestContact(userId: ID): [PendingContact]
        acceptContact(userId: ID): [User]
        denyContact(userId: ID): [PendingContact]
        removeContact(userId: ID): [User]
        createPlace(placeInput: PlaceInput): Place
        updatePlace(placeId: ID!, placeUpdate: PlaceUpdate): Place
        deletePlace(placeId: ID!): [Place]
        createCatch(catchInput: CatchInput): Catch
        updateCatch(catchId: ID!, catchUpdate: CatchUpdate): Catch
        deleteCatch(catchId: ID!): [Catch]
    }

    input MessageInput {
        group: ID!,
        body: String, 
        media: [MediaInput], 
        catch: ID, 
        place: ID,
        type: MessageType!
    }

    
    input GroupInput{
        users: [ID],
        name: String,
        avatar: MediaInput,
        created_by: ID!
    }

    input GroupUpdate{
        name: String,
        avatar: MediaInput
    }

    
    input UserUpdate{
        firstName: String,
        lastName: String,
        bio: String,
        location: String,
        avatar: MediaInput
    }

    input PlaceInput{
        name: String!, 
        publish_type: PublishType!, 
        coordinates: [Float]!, 
        description: String, 
        avatar: MediaInput,
        group: ID
    }

    input PlaceUpdate{
        name: String,
        description: String,
        coordinates: [Float],
        avatar: MediaInput
    }

    input CatchInput{
        title: String,
        place: ID, 
        location: LocationInput,
        publish_type: PublishType!,
        species: String!, 
        group: ID,
        length: LengthInput, 
        weight: WeightInput, 
        rig: String, 
        media: [MediaInput]
    }

    input CatchUpdate{
        place: ID,
        location: LocationInput,
        title: String,
        species: String,
        length: LengthInput,
        weight: WeightInput,
        rig: String,
        media: [MediaInput]
    }

    input MediaInput {
        id: ID!,
        url: String
    }

    input LengthInput{
        value: Float!,
        unit: LengthUnit!
    }

    input WeightInput{
        value: Float!,
        unit: WeightUnit!
    }

    input LocationInput {
        type: String,
        coordinates: [Float]!
    }
`