const mongoose = require('mongoose');
const Conversation = require('../models/conversation');

exports.initiateConversation = async (req, res) => {
  try {
    console.log("👉 Données reçues dans initiateConversation :", req.body);

    const { envoye_par, recu_par, don_id } = req.body;

    if (!envoye_par || !recu_par || !don_id) {
      return res.status(400).json({ message: "Champs requis manquants." });
    }

    const conversationExistante = await Conversation.findOne({
      donorId: envoye_par,
      receiverId: recu_par,
      donId: don_id,
    });

    if (conversationExistante) {
      return res.status(200).json({ conversation: conversationExistante });
    }

    const nouvelleConversation = new Conversation({
      donorId: envoye_par,
      receiverId: recu_par,
      donId: don_id,
    });

    const conversationSauvegardee = await nouvelleConversation.save();

    res.status(201).json({ conversation: conversationSauvegardee });
  } catch (error) {
    console.error("❌ Erreur dans initiateConversation :", error);
    res.status(500).json({ message: "Erreur serveur lors de la création de la conversation." });
  }
};
