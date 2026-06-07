const Conversation = require('../models/Conversation');

exports.getConversations = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const convs = await Conversation.find({ participants: userId })
      .populate('participants', 'name initials avatarColor role online')
      .sort({ lastMessageAt: -1 });

    res.json(convs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createConversation = async (req, res) => {
  try {
    const { userAId, userBId, requestTitle } = req.body;

    let conv = await Conversation.findOne({
      participants: { $all: [userAId, userBId], $size: 2 }
    }).populate('participants', 'name initials avatarColor role online');

    if (!conv) {
      conv = await Conversation.create({
        participants:  [userAId, userBId],
        requestTitle:  requestTitle || '',
      });
      conv = await conv.populate('participants', 'name initials avatarColor role online');
    }

    res.status(201).json(conv);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
