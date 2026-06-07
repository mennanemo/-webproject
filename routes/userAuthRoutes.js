const express = require('express');
const userController = require('../controller/userController');
const { protect, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/admin/create', protect, requireAdmin, userController.createAdmin);
router.post('/:id/role', protect, userController.setRole);
router.get('/', protect, requireAdmin, userController.getAllUsers);
router.get('/:id', protect, userController.getUserById);
router.delete('/:id', protect, requireAdmin, userController.deleteUser);

module.exports = router;
