const express = require('express')
const router = express.Router();
const {createChat,findChat,findUserChats}= require("../controllers/chatController")



router.post("/",createChat )

router.get("/:userId",findUserChats )

router.get('/find/:firsId/:secondId', findChat);



module.exports = router;