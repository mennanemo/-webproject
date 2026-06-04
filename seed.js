require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');
const Conversation = require('./models/Conversation');
const Message  = require('./models/Message');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kroww';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected. Clearing old data…');

  await User.deleteMany({});
  await Conversation.deleteMany({});
  await Message.deleteMany({});

  // Create users
  const [me, menna, karim, lena, omar] = await User.insertMany([
    { name: 'You',   initials: 'ME', avatarColor: '#444444', role: 'Client',    online: true  },
    { name: 'Menna', initials: 'SM', avatarColor: '#970A12', role: 'Designer',  online: true  },
    { name: 'Karim', initials: 'KB', avatarColor: '#5686BB', role: 'Developer', online: true  },
    { name: 'Lena',  initials: 'LF', avatarColor: '#D1601F', role: 'Writer',    online: false },
    { name: 'Omar',  initials: 'ON', avatarColor: '#70191D', role: 'Marketer',  online: false },
  ]);

  console.log('Users created.');

  async function createConv(otherUser, requestTitle, messages) {
    const conv = await Conversation.create({
      participants: [me._id, otherUser._id],
      requestTitle,
      lastMessage: messages[messages.length - 1].text || '',
      lastMessageAt: new Date(),
    });
    for (const m of messages) {
      await Message.create({
        conversationId: conv._id,
        senderId: m.from === 'me' ? me._id : otherUser._id,
        type: m.type || 'text',
        text: m.text,
        fileName: m.name,
        fileSize: m.size,
        offerPrice: m.price,
        offerDelivery: m.delivery,
        offerNote: m.note,
        offerStatus: m.offerStatus || 'pending',
      });
    }
    return conv;
  }

  await createConv(menna, 'Logo for The Roasted Bean', [
    { from:'them', text:"Hi! I saw your request — I'd love to help with your coffee shop logo 🎨" },
    { from:'me',   text:"Great! I love your portfolio. Go with the earthy terracotta palette." },
    { from:'them', type:'file', name:'initial_moodboard.pdf', size:'1.2 MB' },
    { from:'them', text:"Here's a mood board before I start the concepts. Does this direction feel right?" },
    { from:'me',   text:"This is exactly the vibe! Let's go 🙌" },
    { from:'them', type:'offer', price:75, delivery:'3 days', note:'3 concepts, unlimited revisions, all source files.', offerStatus:'accepted' },
    { from:'me',   text:"Offer accepted!" },
    { from:'them', text:"I've sent the first draft!" },
    { from:'them', type:'file', name:'logo_concept_v1.zip', size:'4.8 MB' },
  ]);

  await createConv(karim, 'React web app build', [
    { from:'them', text:'Hey! React app is done. Staging link is ready.' },
    { from:'me',   text:'Testing now… looks great overall!' },
    { from:'me',   text:"One issue: mobile nav doesn't close on outside tap." },
    { from:'them', text:'On it! Fix coming tonight.' },
  ]);

  await createConv(lena, '5 SEO blog articles', [
    { from:'them', text:'All 5 articles delivered with SEO optimization.' },
    { from:'me',   text:'These are brilliant, exactly what we needed! Releasing payment.' },
    { from:'them', text:'Thanks for the 5 stars! 🙏' },
  ]);

  await createConv(omar, 'Instagram & TikTok ads', [
    { from:'them', text:'Instagram + TikTok campaigns are live! CTR is 3.2%.' },
    { from:'me',   text:'Great work Omar!' },
    { from:'them', text:'Campaign is live! Full report at end of week.' },
  ]);

  console.log('✅ Seed complete!');
  console.log(`\nYour user ID (save this!): ${me._id}`);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });