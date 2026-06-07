

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/reviewController');



const protect = (req, res, next) => {
 req.user = { _id: 'placeholder_user_id' };
  next();
};

router.post('/leave', protect, controller.leaveReview);


router.get('/user/:userId', protect, controller.getReviewsForUser);


router.get('/proposal/:proposalId', protect, controller.getReviewsForProposal);


router.get('/my', protect, controller.getMyReviews);

module.exports = router;