const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const socket = require('./socket'); // Ton module socket.js
const contactRoutes = require('./routes/contact');
const newsletterRoutes = require('./routes/newsletter');
const chatRoutes = require('./routes/chat');
const getBotReply = require('./utils/botReplyKeywords');
const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);
const io = socket.init(server); // ✅ La seule instance utilisée

const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connecté'))
.catch(err => console.error('Erreur MongoDB:', err));

// Routes API
app.use('/auth', authRoutes);
app.use('/pointage', attendanceRoutes);
app.use('/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/chat', chatRoutes);

// === SOCKET.IO CHAT ===
const userSockets = {}; // Pour stocker les infos utilisateurs

io.on('connection', (socket) => {
  console.log(`✅ Socket connecté : ${socket.id}`);

  socket.on('join-user-room', ({ userId }) => {
    socket.join(userId);
    console.log(`👤 Utilisateur dans la room : ${userId}`);
  });

  socket.on('message', (data) => {
    const { text, firstname, lastname, socketId, userId } = data;
    userSockets[socket.id] = { firstname, lastname, userId };

    console.log(`📩 ${firstname} ${lastname} : ${text}`);

    io.emit('admin-receive-message', {
      text,
      firstname,
      lastname,
      socketId,
      userId
    });

    const reply = getBotReply(text);
    socket.emit('chat reply', reply);
  });

  socket.on('admin-send-message', ({ userId, text }) => {
    if (userId) {
      io.to(userId).emit('admin-to-user', text);
      console.log(`📤 Admin → ${userId} : ${text}`);
    } else {
      console.warn('❌ Aucun userId fourni à admin-send-message');
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Déconnexion : ${socket.id}`);
    delete userSockets[socket.id];
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrage
server.listen(PORT, () => console.log(`🚀 Serveur sur http://localhost:${PORT}`));
