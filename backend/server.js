const path = require('path');
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db.js"); 
const authRoutes = require('./routes/authRoutes'); 
const donRoutes = require('./routes/donRoutes');
const notificationsRoutes = require('./routes/notificationsRoute');
const conversationRoutes = require('./routes/conversationRoutes.js')
const messageRoutes = require('./routes/messageRoutes');
const Message = require('./models/Message');
const http = require('http');

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');

const io = new Server(server, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST']
  },
  pingInterval: 25000,
  pingTimeout: 60000
});

const PORT = process.env.PORT || 5000;

connectDB();
if (!process.env.MONGO_URI) {
  console.error("❌ Erreur : La variable d'environnement MONGODB_URI est introuvable.");
  process.exit(1);
}

app.use(cors({
  origin:  '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
 credentials: false 
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);
app.use('/api/dons', donRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api', conversationRoutes);
app.use('/api/message', messageRoutes);

app.use('/uploads', express.static('uploads'));
//app.options('*', cors());



app.get("/", (req, res) => {
  res.send("Backend Diapo fonctionne avec MongoDB !");
}); 

app.post('/', (req, res) => {
  
});

// WebSocket connections
io.on('connection', (socket) => {
  console.log('🟢 Un utilisateur s\'est connecté :', socket.id);

  // Rejoindre une room basée sur le don_id (conversation)
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
console.log(`📦 Socket ${socket.id} a rejoint la room ${roomId}`);
console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  });

  // Envoi de message
  socket.on('sendMessage', async (data) => {
  const { texte, envoye_par, recu_par, conversationId } = data;

const message = new Message({ texte, envoye_par, recu_par, conversationId });
const savedMessage = await message.save();

io.to(conversationId).emit('receiveMessage', savedMessage);

});


  socket.on('disconnect', () => {
    console.log('🔴 Un utilisateur s\'est déconnecté :', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
