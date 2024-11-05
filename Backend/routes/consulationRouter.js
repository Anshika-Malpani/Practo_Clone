const express = require('express');
const router = express.Router();
const consultationModel = require('../models/consultation-model'); // Consultation Model

// POST endpoint to store a consultation request
router.post('/', async (req, res) => {
    try {
        const {patientId, patientName, specialization, doctor_id } = req.body;

        // Create a new consultation record
        const newConsultation = new consultationModel({
            patientId,
            patientName,
            specialization,
            doctor_id,
        });

        await newConsultation.save();
        res.status(201).json({ message: 'Consultation booked successfully!' });
    } catch (error) {
        console.error('Error booking consultation:', error);
        res.status(500).json({ message: 'Failed to book consultation', error });
    }
});

router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        // Validate that the status is a valid value
        const validStatuses = ['pending', 'scheduled', 'completed', 'canceled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        // Find the consultation and update its status
        const updatedConsultation = await consultationModel.findByIdAndUpdate(
            id,
            { status },
            { new: true } // Return the updated document
        );

        if (!updatedConsultation) {
            return res.status(404).json({ message: 'Consultation not found' });
        }

        res.status(200).json(updatedConsultation);
    } catch (error) {
        console.error('Error updating consultation:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



module.exports = router;
