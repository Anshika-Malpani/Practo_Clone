const messageModel = require("../models/message-model");
const cloudinary = require("../config/cloudinary"); // Import Cloudinary config
const fs = require('fs');

// Create a message with optional media
module.exports.createMessage = async (req, res) => {
    const { chatId, senderId, text } = req.body;
  
    try {
      let media = null;
      console.log("media",req.file);
      
  
      // Upload media to Cloudinary if a file is present
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: req.file.mimetype.startsWith('video') ? 'video' : 'image',
        });
  
        media = {
          url: result.secure_url,
          type: req.file.mimetype.startsWith('video') ? 'video' : 'image',
        };
  
        // Remove the file from local storage
        fs.unlinkSync(req.file.path);
      }
  
      // Create the message with or without media
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

// Get messages by chatId
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
