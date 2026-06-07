require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');

const app= express();
const server= http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/controllers', express.static(path.join(__dirname, 'controllers')));
app.use('/css', express.static(path.join(__dirname, 'views', 'css')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
app.get('/data.json', (req, res) => res.sendFile(path.join(__dirname, 'data.json')));
app.get('/file.json', (req, res) => res.sendFile(path.join(__dirname, 'file.json')));
app.get('/images/:file', (req, res) => res.sendFile(path.join(__dirname, 'images', req.params.file), (err) => {
  if (err) res.status(404).end();
}));
app.get('/dashboard%20-%20admin.html', (req, res) => res.redirect('/dashboard-admin.html'));

app.use('/api/users', require('./routes/users'));
app.use('/api/conversations', require('./routes/conversations'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/proposals', require('./routes/proposal'));
app.use('/api/reviews', require('./routes/review'));

app.get('/', (req, res) => res.json({ status: 'Kroww API running' }));

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('join_room', (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined room ${conversationId}`);
  });

  socket.on('leave_room', (conversationId) => {
    socket.leave(conversationId);
  });

  socket.on('send_message', (data) => {
    socket.to(data.conversationId).emit('receive_message', data.message);
  });

  socket.on('typing', (data) => {
    socket.to(data.conversationId).emit('typing', { userName: data.userName });
  });

  socket.on('stop_typing', (data) => {
    socket.to(data.conversationId).emit('stop_typing');
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kroww';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
