

const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema(
  {
    
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    },

    
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

   
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true
    },

   
    agreedPrice: {
      type: Number,
      required: true,
      min: 0
    },

    
    currency: {
      type: String,
      default: 'USD'
    },

    
    jobTitle: {
      type: String,
      required: true
    },

   
    message: {
      type: String,
      default: ''
    },

    
    deliveryDays: {
      type: Number,
      default: 1
    },

    
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled'],
      default: 'pending'
    },

    
    acceptedAt: {
      type: Date
    },

   
    rejectedAt: {
      type: Date
    }
  },

  
  { timestamps: true }
);

module.exports = mongoose.model('Proposal', proposalSchema);