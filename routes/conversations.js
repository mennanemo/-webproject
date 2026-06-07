const router = require('express').Router();
const {
  getConversations,
  createConversation
} = require('../controllers/conversationController');

router.get('/',   getConversations);
router.post('/',  createConversation);

module.exports = router;
