const mongoose = require('mongoose')

const recordingSchema = mongoose.Schema({
    url: String
},
{ timestamps: true }
)

module.exports=mongoose.model("recording",recordingSchema)