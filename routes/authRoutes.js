const express = require('express');
const authController = require('../controller/authController');
const { protect } = require('../middleware/authMid');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);

module.exports = router;

