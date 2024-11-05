const express = require('express')
const router = express.Router();
const meetingModel=require("../models/meeting-model")




router.post('/schedule-meeting', async (req, res) => {
    try {
        const { consultationId, doctor, date, time, description } = req.body;
        const newMeeting = new meetingModel({ consultationId, doctor, date, time, description });
        await newMeeting.save();
        res.status(201).json({ message: 'Meeting scheduled successfully', meeting: newMeeting });
    } catch (error) {
        res.status(500).json({ message: 'Error scheduling meeting', error });
    }
});




module.exports = router;