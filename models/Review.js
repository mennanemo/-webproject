

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    
    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proposal',
      required: true
    },

    
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    
    reviewerRole: {
      type: String,
      enum: ['client', 'freelancer'],
      required: true
    },

  
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },

    
    comment: {
      type: String,
      required: true,
      maxlength: 1000
    }
  },

  
  { timestamps: true }
);



reviewSchema.index({ proposalId: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);