const mongoose = require('mongoose')

const meetingSchema = new mongoose.Schema({
    consultationId: {type: mongoose.Schema.Types.ObjectId, 
        ref: 'Consultation', 
        required: true },
    doctor: String,
    date: String,
    time: String,
    description: String,
});

module.exports=mongoose.model("meeting",meetingSchema)