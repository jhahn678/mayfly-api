const User = require('../../models/user')
const { faker } = require('@faker-js/faker')

module.exports = createUser = async () => {
    const fakeFirstName = faker.name.firstName()
    const fakeLastName = faker.name.lastName()
    const user = new User({
        details: {
            firstName: fakeFirstName,
            lastName: fakeLastName,
            fullName: `${fakeFirstName} ${fakeLastName}`,
            username: faker.datatype.uuid(),
        },
        account: {
            email: faker.unique(faker.internet.email)
        }
    })
    return (await user.save())
}