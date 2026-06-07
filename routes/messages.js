const router = require('express').Router();
const {
  getMessages, createMessage, uploadFile, respondToOffer
} = require('../controllers/messageController');

router.post('/upload', uploadFile); 
router.get('/:conversationId', getMessages);
router.post('/', createMessage);
router.patch('/:id/offer', respondToOffer);

module.exports = router;