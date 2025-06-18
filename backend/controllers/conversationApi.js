const mongoose = require('mongoose');
const Conversation = require('../models/conversation');

exports.initiateConversation = async (req, res) => {
  try {
    console.log("✅ Requête reçue à /api/conversations/initiate");
    console.log("📦 Corps de la requête :", req.body);

    const { envoye_par, recu_par, don_id } = req.body;

    // Vérification des champs obligatoires
    if (!envoye_par || !recu_par || !don_id) {
      console.log("⛔ Champs requis manquants");
      return res.status(400).json({ message: "Champs requis manquants." });
    }

    // Recherche d'une conversation existante
    const existingConversation = await Conversation.findOne({
      don_id,
      participants: { $all: [envoye_par, recu_par] }
    }).populate("participants don_id");

    if (existingConversation) {
      console.log("ℹ️ Conversation existante trouvée :", existingConversation._id);
      return res.status(200).json({ conversation: existingConversation });
    }

    // Création d'une nouvelle conversation
    const nouvelleConversation = new Conversation({
      envoye_par,
      recu_par,
      don_id,
      participants: [envoye_par, recu_par],
    });

    const conversationSauvegardee = await nouvelleConversation.save();

    // Populate après le save
    const populatedConversation = await Conversation.findById(conversationSauvegardee._id)
      .populate("participants")
      .populate("don_id");

    console.log("✅ Nouvelle conversation créée :", populatedConversation);

    return res.status(201).json({ conversation: populatedConversation });

  } catch (error) {
    console.error("❌ Erreur serveur dans initiateConversation :", error);
    return res.status(500).json({ message: "Erreur serveur lors de la création de la conversation." });
  }
};
