const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  donId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Don',
    required: true
  },
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  ],
  don_id: { // si tu n'en as plus besoin, tu peux le retirer
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Don',
    required: false,
  },
  dernierMessage: {
    contenu: String,
    envoye_par: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    envoye_le: Date,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Conversation', conversationSchema);
