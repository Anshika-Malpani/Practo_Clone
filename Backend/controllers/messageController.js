const messageModel = require("../models/message-model");
const cloudinary = require("../config/cloudinary"); 
const fs = require('fs');


module.exports.createMessage = async (req, res) => {
    const { chatId, senderId, text } = req.body;
  
    try {
      let media = null;
      console.log("media",req.file);
      
  
    
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: req.file.mimetype.startsWith('video') ? 'video' : 'image',
        });
  
        media = {
          url: result.secure_url,
          type: req.file.mimetype.startsWith('video') ? 'video' : 'image',
        };
  
       
        fs.unlinkSync(req.file.path);
      }
  
      const message = await messageModel.create({
        chatId,
        senderId,
        text,
        media,
      });
  
      res.status(200).json(message);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create message' });
    }
  };


module.exports.getMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await messageModel.find({ chatId });
    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get messages" });
  }
};
