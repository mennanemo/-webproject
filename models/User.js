const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:   { type: String, required: true },
  initials: { type: String, required: true },
  avatarColor: { type: String, default: '#970A12' },
  role:   { type: String, default: 'Freelancer' },
  online: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
