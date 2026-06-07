const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  requestTitle: { type: String, default: '' },
  lastMessage:  { type: String, default: '' },
  lastMessageAt: { type: Date, default: Date.now },
  unreadCount:  { type: Map, of: Number, default: {} }, // { userId: count }
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
