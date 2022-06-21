const connectMongoDB = require('../../config/mongodb')
const mongoose = require('mongoose')
const User = require('../../models/user')
const Catch = require('../../models/catch')
const Group = require('../../models/group')
const Place = require('../../models/place')
const catchResolver = require('../../graphql/resolvers/catch')

jest.setTimeout(20000)

beforeAll(async() => {
    await connectMongoDB()
})

afterAll(async() => {
    await mongoose.disconnect()
})

test('Adding a catch to a place', async function(){

    const place = await Place.findOne({})
    const user = await User.findOne({})

    const catchInput = { place: place._id, species: 'Northern Pike', publish_type: 'PUBLIC' }
    const auth = { _id: user._id.toString() }

    const result = await catchResolver.Mutation.createCatch({}, { catchInput }, { auth })
    expect(result.length).toBe(user.catches.length + 1)

    const expected = expect.objectContaining({ place: place._id, species: 'Northern Pike', publish_type: 'PUBLIC' })

    const populatedUser = await User.findById(user._id).populate('catches').select('catches')
    expect(populatedUser.catches).toEqual(expect.arrayContaining([expected]))

    const populatedPlace = await Place.findById(place._id).populate('catches')
    const expectedCatch = expect.objectContaining({ user: user._id, species: 'Northern Pike', publish_type: 'PUBLIC'})
    expect(populatedPlace.catches).toEqual(expect.arrayContaining([ expectedCatch ]))
})


test('Unlinking place from catch', async function(){

    const user = await User.findOne({})
    const place = await Place.findOne({})

    const auth = { _id: user._id.toString() }
    const catchInput = { place: place._id, species: 'MUSKY', publish_type: 'PUBLIC'}

    const userCatches = await catchResolver.Mutation.createCatch({}, { catchInput }, { auth })
    const catchId = userCatches.find(id => !user.catches.includes(id) )

    const catchUpdate = { place: null }
    const result = await catchResolver.Mutation.updateCatch({}, { catchId: catchId, catchUpdate }, { auth })

    //Expect place to be unset on catch
    expect(result.place).toBe(null)

    const placeUpdated = await Place.findById(place._id)
    //Expect catch to be removed from place
    expect(placeUpdated.catches).toEqual(expect.not.arrayContaining([catchId]))
})

test('Adding a catch to a group and place', async function(){

    const place = await Place.findOne({})
    const user = await User.findOne({})
    const group = await Group.findById(user.groups[0])

    const auth = { _id: user._id.toString() }
    const catchInput = { place: place._id, group: group._id, species: 'Northern SUCKER', publish_type: 'PRIVATE' }

    const userCatches = await catchResolver.Mutation.createCatch({}, { catchInput }, { auth })

    const catchId = userCatches.find(id => !user.catches.includes(id))
    
    const updatedPlace = await Place.findById(place._id).populate('catches')

    expect(updatedPlace.catches.length).toBe(place.catches.length + 1)
    expect(updatedPlace.catches).toEqual(expect.arrayContaining([expect.objectContaining({ _id: catchId })]))

    const updatedGroup = await Group.findById(group._id).populate('catches')

    expect(updatedGroup.catches.length).toBe(group.catches.length + 1)
    expect(updatedGroup.catches).toEqual(expect.arrayContaining([expect.objectContaining({ _id: catchId })]))
})


test('Deleting a catch linked to group and place', async function(){

    const place = await Place.findOne({})
    const user = await User.findOne({})
    const group = await Group.findById(user.groups[0])

    const auth = { _id: user._id.toString() }
    const catchInput = { place: place._id, group: group._id, species: 'Northern Pike' }

    const userCatches = await catchResolver.Mutation.createCatch({}, { catchInput }, { auth })

    const catchId = userCatches.find(id => !user.catches.includes(id))

    const updatedUserCatches = await catchResolver.Mutation.deleteCatch({}, { catchId: catchId }, { auth })
    expect(updatedUserCatches).toEqual(expect.not.arrayContaining([catchId]))

    const updatedGroup = await Group.findById(group._id)
    expect(updatedGroup.catches).toEqual(expect.not.arrayContaining([catchId]))

    const updatedPlace = await Place.findById(place._id)
    expect(updatedPlace.catches).toEqual(expect.not.arrayContaining([catchId]))
})

