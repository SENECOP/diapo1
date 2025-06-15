const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  donId: { type: mongoose.Schema.Types.ObjectId, ref: 'Don', required: true },
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  ],
  dernierMessage: {
    contenu: String,
    envoye_par: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    envoye_le: Date,
  },
}, { timestamps: true });  // <-- ça gère createdAt et updatedAt automatiquement

module.exports = mongoose.model('Conversation', conversationSchema);
