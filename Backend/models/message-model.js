const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      default: '',
    },
    media: {
      url: String,
      type: {
        type: String,
        enum: ['image', 'video'],
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
