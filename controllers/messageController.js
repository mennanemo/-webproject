const path= require('path');
const fs = require('fs');
const multer = require('multer');
const {v4: uuidv4} = require('uuid');
const Message= require('../models/Message');
const Conversation = require('../models/Conversation');


const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

exports.getMessages = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 50;

    const messages = await Message.find({ conversationId: req.params.conversationId })
      .populate('senderId', 'name initials avatarColor')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .then(msgs => msgs.reverse()); 

    const { userId } = req.query;
    if (userId) {
      await Message.updateMany(
        { conversationId: req.params.conversationId, senderId: { $ne: userId }, read: false },
        { read: true }
      );
      await Conversation.findByIdAndUpdate(req.params.conversationId, {
        [`unreadCount.${userId}`]: 0
      });
    }

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.createMessage = async (req, res) => {
  try {
    const { conversationId, senderId, type, text, offerPrice, offerDelivery, offerNote } = req.body;

    const msg = await Message.create({
      conversationId,
      senderId,
      type: type || 'text',
      text,
      offerPrice,
      offerDelivery,
      offerNote,
    });

    const populated = await msg.populate('senderId', 'name initials avatarColor');

    const conv = await Conversation.findById(conversationId);
    if (conv) {
      conv.lastMessage   = type === 'offer' ? `💰 Offer: $${offerPrice}` : text;
      conv.lastMessageAt = new Date();
      conv.participants.forEach(pid => {
        if (pid.toString() !== senderId) {
          const cur = conv.unreadCount.get(pid.toString()) || 0;
          conv.unreadCount.set(pid.toString(), cur + 1);
        }
      });
      await conv.save();
    }

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.uploadFile = [
  upload.single('file'),
  async (req, res) => {
    try {
      const { conversationId, senderId } = req.body;
      const file = req.file;
      if (!file) return res.status(400).json({ error: 'No file uploaded' });

      const sizeKB  = file.size / 1024;
      const sizeStr = sizeKB > 1024
        ? (sizeKB / 1024).toFixed(1) + ' MB'
        : sizeKB.toFixed(0) + ' KB';

      const msg = await Message.create({
        conversationId,
        senderId,
        type:     'file',
        fileName: file.originalname,
        fileSize: sizeStr,
        fileUrl:  `/uploads/${file.filename}`,
      });

      const populated = await msg.populate('senderId', 'name initials avatarColor');

      const conv = await Conversation.findById(conversationId);
      if (conv) {
        conv.lastMessage   = `📎 ${file.originalname}`;
        conv.lastMessageAt = new Date();
        conv.participants.forEach(pid => {
          if (pid.toString() !== senderId) {
            const cur = conv.unreadCount.get(pid.toString()) || 0;
            conv.unreadCount.set(pid.toString(), cur + 1);
          }
        });
        await conv.save();
      }

      res.status(201).json(populated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
];

exports.respondToOffer = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'status must be accepted or declined' });
    }

    const msg = await Message.findByIdAndUpdate(
      req.params.id,
      { offerStatus: status },
      { new: true }
    ).populate('senderId', 'name initials avatarColor');

    if (!msg) return res.status(404).json({ error: 'Message not found' });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
