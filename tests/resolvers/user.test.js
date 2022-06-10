const User = require('../../models/user')
const mongoose = require('mongoose')
const connectMongoDB = require('../../config/mongodb')
const userResolver = require('../../graphql/resolvers/user')
const createUser = require('../utils/createUser')

jest.setTimeout(20000)

beforeAll(async() => {
    await connectMongoDB()
})

afterAll(async() => {
    await mongoose.disconnect()
})

test('Updating user details', async function(){
    const user = await User.findOne({})
    const auth = { _id: user._id.toString() }
    const userUpdate = { firstName: 'Geramund', bio: 'test bio' }

    const updatedUser = await userResolver.Mutation.updateUser({}, { userUpdate: userUpdate }, { auth: auth })
    const expectedUserDetails = {
        firstName: userUpdate.firstName,
        lastName: user.details.lastName,
        fullName: `${userUpdate.firstName} ${user.details.lastName}`,
        bio: userUpdate.bio,
        username: user.details.username
    }

    expect(updatedUser.details).toMatchObject(expectedUserDetails)
})

test('Send contact request', async function(){
    const user = await createUser()
    const user2 = await createUser()

    const userId = user2._id.toString()

    const auth = { _id: user._id.toString() }

    const pendingContacts = await userResolver.Mutation.requestContact({}, { userId: userId }, { auth: auth })
    //Check that TO request is in users pending request
    expect(pendingContacts.find(pc => pc.user.toString() === userId && pc.status === 'TO')).toBeTruthy()

    const otherUser = await User.findById(userId)
    //Check that FROM request is in other users pending requests
    expect(otherUser.pending_contacts.find(pc => pc.user.toString() === user._id.toString() && pc.status === 'FROM')).toBeTruthy()
})

test('Duplicate contact request', async function(){
    const user = await createUser()
    const user2 = await createUser()

    await User.findByIdAndUpdate(user._id, { $push: { contacts: user2._id.toString() }})
    await User.findByIdAndUpdate(user2._id, { $push: { contacts: user._id.toString() }})

    const auth = { _id: user._id.toString() }

    try{
        await userResolver.Mutation.requestContact({}, { userId: user2._id.toString() }, { auth: auth })
    }catch(err){
        expect(err.message).toBe('User is already in your contacts')
    }

})

test('Accept contact request', async function(){
    const user = await createUser()
    const user2 = await createUser()

    const auth = { _id: user._id.toString() }
    const userId = user2._id.toString()

    await userResolver.Mutation.requestContact({}, { userId: userId }, { auth: auth })

    const contacts = await userResolver.Mutation.acceptContact({}, { userId: user._id.toString() }, { auth: { _id: userId }})
    expect(contacts.find(c => c == user._id.toString())).toBeTruthy()
    const updatedUser2 = await User.findById(user2._id)
    expect(updatedUser2.pending_contacts.length).toBe(0)
  
    const updatedUser = await User.findById(user._id)
    expect(updatedUser.contacts.find(c => c == userId )).toBeTruthy()
    expect(updatedUser.pending_contacts.length).toBe(0)
})


test('Cancel contact request', async function(){
    const user = await createUser()
    const user2 = await createUser()

    const auth = { _id: user._id.toString() }
    const userId = user2._id.toString()

    await userResolver.Mutation.requestContact({}, { userId: userId }, { auth: auth })
    const pending = await userResolver.Mutation.cancelRequestContact({}, { userId: userId }, { auth: auth })
    expect(pending.length).toBe(0)

    const otherUser = await User.findById(user2._id)
    expect(otherUser.pending_contacts.length).toBe(0)
})


test('Deny contact request', async function(){
    const user = await createUser()
    const user2 = await createUser()

    const auth = { _id: user._id.toString() }
    const userId = user2._id.toString()

    await userResolver.Mutation.requestContact({}, { userId: userId }, { auth: auth })

    const pending = await userResolver.Mutation.denyContact({}, { userId: user._id.toString()}, { auth: { _id: userId }})
    expect(pending.length).toBe(0)

    const updatedUser = await User.findById(user._id)
    expect(updatedUser.pending_contacts.length).toBe(0)
})

test('Remove contact', async function(){
    const user = await createUser()
    const user2 = await createUser()

    const userWithContact = await User.findByIdAndUpdate(user._id, { $push: { contacts: user2._id.toString() }}, { new: true })
    const user2WithContact = await User.findByIdAndUpdate(user2._id, { $push: { contacts: user._id.toString() }}, { new: true })

    expect(userWithContact.contacts.length).toBe(1)
    expect(user2WithContact.contacts.length).toBe(1)

    const auth = { _id: user._id.toString() }
    const userId = user2._id.toString()
    
    const contacts = await userResolver.Mutation.removeContact({}, { userId: userId }, { auth: auth })
    expect(contacts.length).toBe(0)

    const user2updated = await User.findById(user2._id)
    expect(user2updated.contacts.length).toBe(0)
})