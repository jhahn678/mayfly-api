const User = require('../../models/user')
const Group = require('../../models/group')
const Place = require('../../models/place')
const Message = require('../../models/message')
const groupResolver = require('../../graphql/resolvers/group')
const placeResolver = require('../../graphql/resolvers/place')
const messageResolver = require('../../graphql/resolvers/message')
const mongoose = require('mongoose')
const connectMongoDB = require('../../config/mongodb')

jest.setTimeout(20000)

beforeAll(async() => {
    await connectMongoDB()
})

afterAll(async() => {
    await mongoose.disconnect()
})


test('New group is created', async function(){
    const user = await User.findOne({})
    const users = await User.find().skip(1).limit(5)
    const userIds = users.map(u => u._id)

    const groupInput = { users: userIds, name: 'Test group'}
    const auth = { _id: user._id.toString() }

    const group = await groupResolver.Mutation.createGroup({}, { groupInput: groupInput }, { auth: auth })

    expect(group.users.length).toEqual(userIds.length + 1)
})

test('User leaves group', async function(){
    const user = await User.findOne({})
    const users = await User.find({}).skip(1).limit(5)

    const auth = { _id: user._id.toString() }
    const groupInput = { users: users.map(u => u._id), name: 'testing group'}

    const newGroup = await groupResolver.Mutation.createGroup({}, { groupInput: groupInput }, { auth: auth })

    expect(newGroup.users.length).toBe(users.length + 1)

    const userGroups = await groupResolver.Mutation.leaveGroup({}, { groupId: newGroup._id }, { auth: auth })

    expect(userGroups.length).toBe(user.groups.length)

    const updatedGroup = await Group.findById(newGroup._id)

    expect(updatedGroup.users.length).toBe(users.length)
})

test('Last user leaves group -- group resources deleted', async function(){
    const user = await User.findOne({})
    
    const auth = { _id: user._id.toString() }
    const groupInput = { users: [], name: 'testing group'}
    const newGroup = await groupResolver.Mutation.createGroup({}, { groupInput: groupInput }, { auth: auth })

    const messageInput = { group: newGroup._id, type: 'TEXT', body: 'This is a test message'}
    const newMessage = await messageResolver.Mutation.createMessage({}, { messageInput: messageInput }, { auth: auth })

    const placeInput = { group: newGroup._id, publish_type: 'SHARED', coordinates: [20, 30]}
    const newPlace = await placeResolver.Mutation.createPlace({}, { placeInput: placeInput }, { auth: auth })

    const updatedGroups = await groupResolver.Mutation.leaveGroup({}, { groupId: newGroup._id }, { auth: auth })
    expect(updatedGroups.length).toBe(user.groups.length)
    
    const updatedPlace = await Place.findById(newPlace._id)
    expect(updatedPlace).toEqual(expect.objectContaining({ publish_type: 'PRIVATE', group : null }))

    const message = await Message.findById(newMessage._id)
    expect(message).toBeFalsy()
    
})

test('Adding users to group -- filtering duplicate users', async function(){
    const user = await User.findOne({})
    
    const auth = { _id: user._id.toString() }
    const groupInput = { users: [], name: 'testing group'}
    const newGroup = await groupResolver.Mutation.createGroup({}, { groupInput: groupInput }, { auth: auth })

    const users = await User.find().limit(5).skip(1)
    const updatedGroup = await groupResolver.Mutation.addUsersToGroup({}, { users: users.map(u => u._id), groupId: newGroup._id}, { auth: auth})
    //Expecting users to be added to group
    expect(updatedGroup.users.length).toBe(6)

    const users2 = await User.find().limit(5).skip(4)
    const updatedGroup2 = await groupResolver.Mutation.addUsersToGroup({}, { users: users2.map(u => u._id), groupId: newGroup._id}, { auth: auth})
    //Expecting only the unique users to be added to the group
    expect(updatedGroup2.users.length).toBe(9)

    //Expecting the group to be in all user.groups
    for(let u of updatedGroup2.users){
        const updatedUser = await User.findById(u)
        expect(updatedUser.groups).toEqual(expect.arrayContaining([updatedGroup2._id]))
    }
})
