const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  ],
  don_id: {
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
