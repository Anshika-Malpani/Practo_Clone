const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require("../config/cloudinary");
const recordingModel = require("../models/recording-model");


const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.single('file'), async (req, res) => {
  const file = req.file;
  

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    
    const uploadStream = cloudinary.uploader.upload_stream({
      resource_type: 'video'
    }, async (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ message: 'Cloudinary upload error', error });
      }

      console.log(result.secure_url);
      
    
      const newVideo = new recordingModel({
        url: result.secure_url,
      });

      await newVideo.save();
      res.status(200).json({ message: 'Video uploaded successfully', url: result.secure_url });
    });

    
    uploadStream.end(file.buffer);

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
