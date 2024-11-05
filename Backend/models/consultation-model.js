const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
    {
        patientId:{ type: mongoose.Schema.Types.ObjectId, 
            ref: 'user', 
            required: true},
        patientName: { type: String, required: true },
        specialization: { type: String, required: true },
        doctor_id: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'doctor', 
            required: true 
        }, 
        status: { type: String, default: 'pending' },
        consultationTime: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Consultation', consultationSchema);
