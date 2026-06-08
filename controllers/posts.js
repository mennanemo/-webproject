const express = require('express');
const router = express.Router();
const Post = require('../models/Post');



router.get('/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post('/', async (req, res) => {
  try {
    const post = new Post({
      user: req.body.userId,
      content: req.body.content,
      image: req.body.image
    });
    const saved = await post.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/react', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.body.userId;

    if (post.reactions.includes(userId)) {
      post.reactions = post.reactions.filter(id => id.toString() !== userId);
    } else {
      post.reactions.push(userId);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;