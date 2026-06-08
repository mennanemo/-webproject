const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.delete('/user/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted by admin' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;