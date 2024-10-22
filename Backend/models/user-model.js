const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    fullname: {
        type:String,
        minLength:3,
        trim:true,
    },
    mobileNumber:Number,
    password: String,
    privateMode:Boolean
    
})

module.exports=mongoose.model("user",userSchema)