const mongoose = require('mongoose')

const messageSchema = mongoose.Schema({
    chatId:String,
    senderId:String,
    text:String
},
{ timestamps: true }
)

module.exports=mongoose.model("message",messageSchema)