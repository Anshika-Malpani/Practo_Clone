const express = require('express')
const router = express.Router();
const {registeredUser,loginUser,logout}= require("../controllers/authController")



router.post("/register",registeredUser )

router.post("/login",loginUser )

router.post('/logout', logout);



module.exports = router;