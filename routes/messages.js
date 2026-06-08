const router = require('express').Router();
const {
  getMessages, createMessage, uploadFile, respondToOffer
} = require('../controllers/messageController');

const { protect } = require('../middleware/authMid');
router.post('/upload', protect, uploadFile); 
router.get('/:conversationId', protect, getMessages);
router.post('/', protect, createMessage);
router.patch('/:id/offer', protect, respondToOffer);

module.exports = router;