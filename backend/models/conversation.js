const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  don_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Don', required: true },
  envoye_par: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recu_par: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  ],
  dernierMessage: {
    contenu: String,
    envoye_par: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    envoye_le: Date,
  },
}, { timestamps: true });

// 🔐 Index unique basé sur les champs renommés
conversationSchema.index({ don_id: 1, envoye_par: 1, recu_par: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', conversationSchema);
