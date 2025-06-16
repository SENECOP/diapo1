const mongoose = require('mongoose');
const Conversation = require('../models/conversation');

exports.initiateConversation = async (req, res) => {
  try {
    console.log("✅ Requête reçue à /api/conversations/initiate");
    console.log("📦 Corps de la requête :", req.body);

    // Attention aux noms des champs envoyés par le client
    const { envoye_par, recu_par, don_id } = req.body;

    // Vérification des champs obligatoires
    if (!envoye_par || !recu_par || !don_id) {
      console.log("⛔ Champs requis manquants");
      return res.status(400).json({ message: "Champs requis manquants." });
    }

    // Recherche d'une conversation existante avec les bons noms de champs du schéma
    const conversationExistante = await Conversation.findOne({
      donorId: envoye_par,
      receiverId: recu_par,
      donId: don_id,
    });

    if (conversationExistante) {
      console.log("🔁 Conversation déjà existante");
      return res.status(200).json({ conversation: conversationExistante });
    }

    // Création d'une nouvelle conversation avec les noms de champs corrects
    const nouvelleConversation = new Conversation({
      donorId: envoye_par,
      receiverId: recu_par,
      donId: don_id,
    });

    const conversationSauvegardee = await nouvelleConversation.save();
    console.log("✅ Nouvelle conversation sauvegardée :", conversationSauvegardee);

    return res.status(201).json({ conversation: conversationSauvegardee });
  } catch (error) {
    console.error("❌ Erreur serveur dans initiateConversation :", error);
    return res.status(500).json({ message: "Erreur serveur lors de la création de la conversation." });
  }
};
