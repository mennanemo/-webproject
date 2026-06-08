const router = require('express').Router();
const {
  getNotifications,
  markConversationRead
} = require('../controllers/notificationsContoller');

const { protect } = require('../middleware/authMid');

router.get('/', protect, getNotifications);
router.post('/mark-read', protect, markConversationRead);

module.exports = router;