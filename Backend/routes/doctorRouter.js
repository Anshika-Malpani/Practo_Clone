const express = require('express')
const router = express.Router();
const {registeredDoctor, loginDoctor, logoutDoctor}= require("../controllers/authController")
const doctorModel = require("../models/doctor-model");
const consultationModel = require('../models/consultation-model');


router.get('/', async (req, res) => {
    try {
        const doctors = await doctorModel.find();
        const specializations = [...new Set(doctors.map(doc => doc.specialization))]; 
        // console.log(doctors);
        
        res.json({ doctors, specializations });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching doctors', error });
    }
});

router.post("/registerDoctor",registeredDoctor )

router.post("/loginDoctor",loginDoctor )

router.post('/logoutDoctor', logoutDoctor);

router.get('/:doctorId/consultations', async (req, res) => {
    try {
        const { doctorId } = req.params;
        
        const consultations = await consultationModel.find({ doctor_id: doctorId })
        .sort({ consultationTime: -1 }); // Latest consultations first
        // console.log(consultations);
        res.status(200).json(consultations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch consultations' });
    }
});





module.exports = router;