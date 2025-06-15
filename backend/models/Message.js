// models/message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  contenu: { type: String, required: true },
  envoye_le: { type: Date, default: Date.now },
  lu: { type: Boolean, default: false },
  don_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Don', required: true },
  envoye_par: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recu_par: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true } // ✅ ajouté
});

module.exports = mongoose.model('Message', messageSchema);
