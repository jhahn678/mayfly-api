const User = require('../../models/user')
const AppError = require('../../utils/AppError')

module.exports = {
    Query: {
        getUser: async (_, { userId }) => {
            const user = await User.findById(userId)
            if(!user) throw new AppError('User not found', 400)
            return user;
        },
        getAllUsers: async () => {
            const users = await User.find()
            return users;
        }
    }
}