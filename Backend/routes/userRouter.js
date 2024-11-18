const express = require('express')
const router = express.Router();
const { registeredUser, loginUser, logout } = require("../controllers/authController")
const userModel = require("../models/user-model");
const meetingModel = require('../models/meeting-model');



router.post("/register", registeredUser)

router.post("/login", loginUser)

router.post('/logout', logout);

router.get('/allUsers', async (req, res) => {
  try {
    const users = await userModel.find();

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/find/:userId', async (req, res) => {
  const userId = req.params.userId
  try {
    const user = await userModel.findById(userId);

    res.json(user);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/privateMode', async (req, res) => {
  try {
    const userId = req.params.id;
    const { privateMode } = req.body;

   
    const user = await userModel.findByIdAndUpdate(userId, { privateMode }, { new: true });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'Private mode updated successfully', user });
  } catch (error) {
    console.error('Error updating private mode:', error);
    res.status(500).json({ error: 'Failed to update private mode' });
  }
});

router.get('/:userId/meetings', async (req, res) => {
  try {
    const userId = req.params.userId;

    const meetings = await meetingModel.find()
      .populate({
        path: 'consultationId',
        match: { patientId: userId },  
      })
      .exec();

   
    const filteredMeetings = meetings.filter(meeting => meeting.consultationId !== null);

  

    res.status(200).json(filteredMeetings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});



module.exports = router;