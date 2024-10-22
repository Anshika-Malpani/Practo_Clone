const mongoose = require('mongoose')

const chatSchema = mongoose.Schema({
    members: Array
},
{ timestamps: true }
)

module.exports=mongoose.model("chat",chatSchema)