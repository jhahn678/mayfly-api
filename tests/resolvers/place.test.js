const User = require('../../models/user')
const Group = require('../../models/group')
const placeResolver = require('../../graphql/resolvers/place')
const mongoose = require('mongoose')
const connectMongoDB = require('../../config/mongodb')

jest.setTimeout(20000)

beforeAll(async() => {
    await connectMongoDB()
})

afterAll(async() => {
    await mongoose.disconnect()
})


test('Creating a place', async function(){
    const user = await User.findOne({})
    const group = user.groups[0]

    const auth = { _id: user._id.toString() }
    const placeInput = { name: 'Test place', publish_type: 'SHARED', coordinates: [23, 30], group: group.toString() }

    const newPlace = await placeResolver.Mutation.createPlace({}, { placeInput: placeInput }, { auth: auth })
    const placeId = newPlace._id.toString()

    const updatedUser = await User.findById(user._id)
    //Check that placeId was added to user.places
    expect(updatedUser.places.find(p => p._id.toString() === placeId)).toBeTruthy()

    const updatedGroup = await Group.findById(group)
    //check that placeId was added to group.places
    expect(updatedGroup.places.find(p => p._id.toString() === placeId)).toBeTruthy()
})

test('Update a place', async function(){
    const user = await User.findOne({})

    const auth = { _id: user._id.toString() }
    const placeInput = { name: 'a new test place', publish_type: 'PUBLIC', coordinates: [21, 34], avatar: { id: 62452345, url: '564154hgadsfa'} }

    const newPlace = await placeResolver.Mutation.createPlace({}, { placeInput: placeInput }, { auth: auth })

    const placeId = newPlace._id.toString()
    const placeUpdate = { name: 'RIVERHOUSE', avatar: { id: '123jf98343jg4', url: 'www.fake.com'} }

    const updatedPlace = await placeResolver.Mutation.updatePlace({}, { placeId: placeId, placeUpdate: placeUpdate}, { auth: auth })
    expect(updatedPlace.avatar).toMatchObject(placeUpdate.avatar)
    expect(updatedPlace.name).toBe('RIVERHOUSE')
})

test('Delete a place', async function(){
    const user = await User.findOne({})
    const groupId = user.groups[0].toString()

    const auth = { _id: user._id.toString() }
    const placeInput = { name: 'test place to be deleted', publish_type: 'PUBLIC', coordinates: [21, 34], group: groupId }

    const newPlace = await placeResolver.Mutation.createPlace({}, { placeInput: placeInput }, { auth: auth })

    const placeId = newPlace._id.toString()

    await placeResolver.Mutation.deletePlace({}, { placeId: placeId }, { auth: auth })

    const updatedUser = await User.findById(user._id)
    //Check that placeId is pulled from user.places
    expect(updatedUser.places.find(p => p._id.toString() === placeId)).toBeFalsy()

    const updatedGroup = await Group.findById(groupId)
    //Check that place is pulled from group.places
    expect(updatedGroup.places.find(p => p._id.toString() === placeId)).toBeFalsy()
})

test('Mutating place -- unauthorized user', async function(){
    const user = await User.findOne({})

    const auth = { _id: user._id.toString() }
    const placeInput = { name: 'a new test place', publish_type: 'PUBLIC', coordinates: [21, 34] }

    const newPlace = await placeResolver.Mutation.createPlace({}, { placeInput: placeInput }, { auth: auth })

    const placeId = newPlace._id.toString()
    const placeUpdate = { name: 'RIVERHOUSE', avatar: { id: '123jf98343jg4', url: 'www.fake.com'} }
    const unauthorized = { _id: '4389245gfdgcigu5842'}

    try{
        await placeResolver.Mutation.updatePlace({}, { placeId: placeId, placeUpdate: placeUpdate}, { auth: unauthorized })
    }catch(err){
        expect(err.message).toMatch('Not authorized')
    }
})


// test('All users can add media', async function(){
//     //Check pulled from user
//     //Check pulled from group
// })