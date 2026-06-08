const express = require('express');
const router = express.Router();
const User = require('../models/User');


const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });



router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (req.body.firstname || req.body.lastname) {
      req.body.name = (req.body.firstname || '') + ' ' + (req.body.lastname || '');
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Profile deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post('/:id/upload/pfp', upload.single('image'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { image: `/uploads/${req.file.filename}` },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/upload/bg', upload.single('pfbg'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { pfbg: `/uploads/${req.file.filename}` },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post('/:id/certificates', upload.single('certificate'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.certificates.push(`/uploads/${req.file.filename}`);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.delete('/:id/certificates/:certIndex', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.certificates.splice(req.params.certIndex, 1);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;