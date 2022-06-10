const connectMongoDB = require('../../config/mongodb')
const dbseed = require('../../utils/dbseed')

module.exports = async function(){
    require('dotenv').config();
    await connectMongoDB()
    await dbseed()
}