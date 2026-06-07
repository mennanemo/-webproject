const Message      = require('../models/Message');
const Conversation = require('../models/Conversation');

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.use.id;

    if (!userId) return res.status(400).json({ error: 'userId required' });

    // Find all conversations this user is in that have unread messages
    const conversations = await Conversation.find({
      participants: userId,
      [`unreadCount.${userId}`]: { $gt: 0 }
    }).populate('participants', 'name initials avatarColor');

    // For each conversation, get the most recent unread message
    const notifications = await Promise.all(
      conversations.map(async (conv) => {
        const lastUnread = await Message.findOne({
          conversationId: conv._id,
          senderId: { $ne: userId },
          read: false
        })
          .populate('senderId', 'name initials avatarColor')
          .sort({ createdAt: -1 });

        if (!lastUnread) return null;

        const other = conv.participants.find(
          p => p._id.toString() !== userId
        );

        return {
          conversationId: conv._id,
          unreadCount:    conv.unreadCount.get(userId) || 0,
          senderName:     other ? other.name : 'Unknown',
          senderInitials: other ? other.initials : '?',
          senderColor:    other ? other.avatarColor : '#970A12',
          preview:        lastUnread.type === 'text'
                            ? lastUnread.text
                            : lastUnread.type === 'file'
                            ? `📎 ${lastUnread.fileName}`
                            : '💰 Sent you an offer',
          time:           lastUnread.createdAt,
        };
      })
    );

    const filtered = notifications
      .filter(Boolean)
      .sort((a, b) => new Date(b.time) - new Date(a.time));

    const totalUnread = filtered.reduce((sum, n) => sum + n.unreadCount, 0);

    res.json({ notifications: filtered, totalUnread });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.markConversationRead = async (req, res) => {
  try {
    const { conversationId, userId } = req.body;
    if (!conversationId || !userId) {
      return res.status(400).json({ error: 'conversationId and userId required' });
    }

    await Message.updateMany(
      { conversationId, senderId: { $ne: userId }, read: false },
      { read: true }
    );

    await Conversation.findByIdAndUpdate(conversationId, {
      [`unreadCount.${userId}`]: 0
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};