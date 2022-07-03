const connectMongoDB = require('../../config/mongodb')
const { seedDatabaseForBackendTesting} = require('../../utils/dbseed')

module.exports = async function(){
    require('dotenv').config();
    await connectMongoDB()
    await seedDatabaseForBackendTesting()
}