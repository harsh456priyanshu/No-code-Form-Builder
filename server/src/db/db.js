const mongoose = require('mongoose');


function connectDB() {
    mongoose.connect(process.env.MONGO_URI)
    .then(()=> {
        console.log("MongoDb is Connected Successfully")
    })
}

module.exports = connectDB