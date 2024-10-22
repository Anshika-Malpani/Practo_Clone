const express = require('express')
const router = express.Router();
const {getMessages,createMessage}= require("../controllers/messageController")



router.post("/",createMessage)

router.get("/:chatId",getMessages )




module.exports = router;