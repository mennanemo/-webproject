const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:   { type: String, required: true },
  initials: { type: String, required: true },
  avatarColor: { type: String, default: '#970A12' },
  role:   { type: String, default: 'Freelancer' },
  online: { type: Boolean, default: false },

   firstname: String,
  lastname: String,
  about: String,
  image: String,
  pfbg: String,
  skills: [String],
  education: [{ school: String, year: String }],
  experience: [{ company: String, years: String }],
  certificates: [String],
  workedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
