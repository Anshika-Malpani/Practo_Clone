const express = require('express')
const router = express.Router();
const {getMessages,createMessage}= require("../controllers/messageController")
const upload = require('../config/multer');



router.post("/", upload.single('media'),createMessage)

router.get("/:chatId",getMessages )




module.exports = router;