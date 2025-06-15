const mongoose = require('mongoose');
const Conversation = require('../models/conversation');

exports.initiateConversation = async (req, res) => {
  const { envoye_par, recu_par, don_id } = req.body;

  console.log("💬 [INITIATE] Envoyé par:", envoye_par, "Reçu par:", recu_par, "Don:", don_id);

  if (!envoye_par || !recu_par || !don_id) {
    return res.status(400).json({ message: "Champs manquants pour créer une conversation." });
  }

  try {
    // Convertir les IDs en ObjectId
    const senderId = new mongoose.Types.ObjectId(envoye_par);
    const receiverId = new mongoose.Types.ObjectId(recu_par);
    const donObjectId = new mongoose.Types.ObjectId(don_id);

    // Vérifie si une conversation existe déjà entre ces trois entités
    let existing = await Conversation.findOne({
      envoye_par: senderId,
      recu_par: receiverId,
      don_id: donObjectId,
    });

    if (existing) {
      console.log("✅ Conversation déjà existante:", existing._id);
      return res.status(200).json(existing);
    }

    const newConv = new Conversation({
      envoye_par: senderId,
      recu_par: receiverId,
      don_id: donObjectId,
      participants: [senderId, receiverId],
      dernierMessage: {
        contenu: "",
        envoye_par: null,
        envoye_le: null,
      },
    });

    const savedConv = await newConv.save();
    console.log("✅ Conversation créée avec succès:", savedConv._id);
    return res.status(201).json(savedConv);

  } catch (error) {
    console.error("❌ Erreur lors de la création de conversation :", error);
    return res.status(500).json({
      message: "Erreur serveur lors de la création de la conversation.",
      error: error.message,
    });
  }
};
