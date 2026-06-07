

const Review = require('../models/Review');      
const Proposal = require('../models/Proposal');


async function leaveReview(req, res) {
  try {
    const { proposalId, rating, comment } = req.body;

    if (!proposalId || !rating || !comment) {
      return res.status(400).json({ message: 'Missing required review fields' });
    }

    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    
    const proposal = await Proposal.findById(proposalId);

    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    
    if (proposal.status !== 'accepted') {
      return res.status(400).json({ message: 'Can only review a completed job' });
    }

    const userId = req.user._id.toString();
    const clientId     = proposal.client.toString();
    const freelancerId = proposal.freelancer.toString();

    
    let reviewerRole, revieweeId;

    if (userId === clientId) {
     
      reviewerRole = 'client';
      revieweeId   = proposal.freelancer;
    } else if (userId === freelancerId) {
      
      reviewerRole = 'freelancer';
      revieweeId   = proposal.client;
    } else {
     
      return res.status(403).json({ message: 'You are not part of this job' });
    }

   
    const alreadyReviewed = await Review.findOne({
      proposalId,
      reviewer: req.user._id
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You already left a review for this job' });
    }

    
    const review = await Review.create({
      proposalId,
      reviewer:     req.user._id,
      reviewee:     revieweeId,
      reviewerRole,
      rating,
      comment
    });

    res.status(201).json({
      message: 'Review submitted successfully!',
      review
    });

  } catch (err) {
    
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You already left a review for this job' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}


async function getReviewsForUser(req, res) {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ reviewee: userId })
      .populate('reviewer', 'firstname lastname')  
      .sort({ createdAt: -1 });                   

    
    let averageRating = 0;
    if (reviews.length > 0) {
      const total  = reviews.reduce((sum, r) => sum + r.rating, 0);
      
      averageRating = (total / reviews.length).toFixed(1);
     
    }

    res.status(200).json({
      userId,
      totalReviews:  reviews.length,
      averageRating: parseFloat(averageRating),
      reviews
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}


async function getReviewsForProposal(req, res) {
  try {
    const { proposalId } = req.params;

    const reviews = await Review.find({ proposalId })
      .populate('reviewer', 'firstname lastname')
      .populate('reviewee', 'firstname lastname');

    res.status(200).json({ reviews });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}


async function getMyReviews(req, res) {
  try {
    const reviews = await Review.find({ reviewee: req.user._id })
      .populate('reviewer', 'firstname lastname')
      .sort({ createdAt: -1 });

    let averageRating = 0;
    if (reviews.length > 0) {
      const total  = reviews.reduce((sum, r) => sum + r.rating, 0);
      averageRating = (total / reviews.length).toFixed(1);
    }

    res.status(200).json({
      totalReviews:  reviews.length,
      averageRating: parseFloat(averageRating),
      reviews
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = {
  leaveReview,
  getReviewsForUser,
  getReviewsForProposal,
  getMyReviews
};