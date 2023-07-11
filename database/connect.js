const mongoose = require('mongoose')

require('dotenv').config()

const connection = mongoose.connect(process.env.MONGODB_URL)
.then(()=>{
    console.log('connection successful')
}).catch(err => console.log('connection failed', err))

module.exports = connection;