

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/proposalController');


const protect = (req, res, next) => {
 req.user = { _id: 'placeholder_user_id' };
  next();
};

router.post('/create', protect, controller.createProposal);


router.get('/:proposalId', protect, controller.getProposalForm);


router.post('/accept', protect, controller.acceptProposal);


router.post('/reject', protect, controller.rejectProposal);


router.post('/cancel', protect, controller.cancelProposal);


router.get('/my/all', protect, controller.getMyProposals);

module.exports = router;