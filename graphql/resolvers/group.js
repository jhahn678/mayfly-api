const User = require('../../models/user')
const Message = require('../../models/message')
const Group = require('../../models/group')
const Catch = require('../../models/catch')
const Place = require('../../models/place')
const AuthError = require('../../utils/AuthError')
const AppError = require('../../utils/AppError')


module.exports = {
    Query: {
        getGroup: async (_, { groupId }) => {
            const group = await Group.findById(groupId)
            if(!group) throw new AppError('Resource not found', 400)
            return group;
        },
        getGroups: async () => {
            return (await Group.find())
        }
    },
    Mutation: {
        createGroup: async (_, { groupInput }, { auth }) => {
            if(!auth._id) throw new AuthError(401, 'Not authenticated')
            const user = await User.findOne({ $and: [
                { _id: auth._id},
                { contacts: { $all: groupInput.users }}
            ]})
            if(!user) throw new AuthError(400, 'Not all users are in your contacts')
            const allUsers = groupInput.users.concat(auth._id)
            const newGroup = new Group({ 
                users: allUsers,
                name: groupInput.name,
                avatar: groupInput.avatar
            })
            const group = await newGroup.save()
            await User.updateMany({ _id: { $in: allUsers }}, {
                $push: { groups: group._id }
            })
            return group;
        },
        addUsersToGroup: async (_, { users, groupId }, { auth }) => {
            if(!auth._id) throw new AuthError(401, 'Not authenticated')
            const user = await User.findById(auth._id)
            if(!user.groups.find(groupId)) throw new AuthError(403, 'Not authorized')
            const group = await Group.findByIdAndUpdate(groupId, {
                $addToSet: { users: { $each: users } }
            }, { new: true })
            return group;
        },
        updateGroup: async (_, { groupId, groupUpdate }, { auth }) => {
            if(!auth._id) throw new AuthError(401, 'Not authenticated')
            const user = await User.findById(auth._id)
            if(!user.groups.includes(groupId)) throw new AuthError(403, 'Not authorized')
            const group = await Group.findByIdAndUpdate(groupId, {
                $set: { ...groupUpdate }
            }, { new: true })
            return group;
        },
        leaveGroup: async (_, { groupId }, { auth }) => {
            if(!auth._id) throw new AuthError(401)
            const user = await User.findByIdAndUpdate(auth._id, {
                $pull: { groups: groupId }
            }, { new: true })
            const group = await Group.findByIdAndUpdate(groupId, { 
                $pull: { users: auth._id }
            }, { new: true })
            if(group.users.length === 0){
                const group = await Group.findByIdAndDelete(groupId)
                await Messages.deleteMany({ _id: { $in: group.messages }})
                await Place.updateMany({ _id: { $in: group.places }}, {
                    $set: { publish_type: 'PRIVATE', group: null }
                })
            }
            return user.groups
        } 
    },
    Group: {
        users: async ({ users }) => {
            return (await User.find({ _id: { $in: users } }))
        },
        messages: async ({ messages }) => {
            return (await Message.find({ _id: { $in: messages }}))
        },
        latest_message: async ({ latest_message }) => {
            return (await Message.findById(latest_message))
        },
        places: async ({ places }) => {
            return (await Place.find({ _id: { $in: places }}))
        },
        catches: async ({ catches }) => {
            return (await Catch.find({ _id: { $in: catches }}))
        }
    }
}