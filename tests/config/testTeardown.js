const mongoose = require('mongoose')

module.exports = async function (){
    await mongoose.disconnect()
}