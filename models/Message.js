const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  senderId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:           { type: String, enum: ['text', 'file', 'offer'], default: 'text' },

  text: { type: String },

  fileName: { type: String },
  fileSize: { type: String },
  fileUrl:  { type: String },

  offerPrice:    { type: Number },
  offerDelivery: { type: String },
  offerNote:     { type: String },
  offerStatus:   { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },

  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
