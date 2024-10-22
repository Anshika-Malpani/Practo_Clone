const express = require('express')
const router = express.Router();
const {registeredDoctor, loginDoctor, logoutDoctor}= require("../controllers/authController")



router.post("/registerDoctor",registeredDoctor )

router.post("/loginDoctor",loginDoctor )

router.post('/logoutDoctor', logoutDoctor);



module.exports = router;