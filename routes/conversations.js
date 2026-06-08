const router = require('express').Router();
const {
  getConversations,
  createConversation
} = require('../controllers/conversationController');

const { protect } = require('../middleware/authMid');

router.get('/', protect, getConversations);
router.post('/', protect, createConversation);

module.exports = router;
