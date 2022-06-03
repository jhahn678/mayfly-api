const mongoose = require('mongoose')

module.exports = connectMongoDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI, { 
            useNewUrlParser: true,
            useUnifiedTopology: false
        })
        console.log('Connected to MongoDB')
    }catch(err){
        console.log(err)
    }
}