const router = require('express').Router();
const {
  getNotifications,
  markConversationRead
} = require('../controllers/notificationsContoller');

router.get('/', getNotifications);
router.post('/mark-read', markConversationRead);

module.exports = router;