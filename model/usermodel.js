const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username:{
        type:String, 
        required:[true,"please enter username"], 
        minlength:5, 
        maxlength:30,
        unique: [true,"username is already taken"]
    },
    password:{
        type: String,
        required:[true,"please enter username"], 
        unique: false
    },
    email:{
        type: String,
        required:[true,"please enter username"], 
        unique: true
    },
    profile:{
        type: String
    }
})

const Usermodel = mongoose.model('UserModel', UserSchema)
module.exports = Usermodel