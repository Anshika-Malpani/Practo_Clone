const mongoose = require('mongoose')

const doctorSchema = mongoose.Schema({
    fullname: {
        type:String,
        minLength:3,
        trim:true,
    },
    mobileNumber: {
        type: Number,
        required: true,
    },
    password: {
        type: String,
        required: true, 
    },
    specialization: {
        type: String,
        required: true, 
    },
    experience: {
        type: Number,
        min: 0, 
    },
},
{ timestamps: true }
)

module.exports=mongoose.model("doctor",doctorSchema)