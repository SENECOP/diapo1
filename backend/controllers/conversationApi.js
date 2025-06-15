const mongoose = require('mongoose');
const Conversation = require('../models/conversation');

exports.initiateConversation = async (req, res) => {
  const { donorId, receiverId, donId } = req.body;

  console.log("💬 [INITIATE] Donor:", donorId, "Receiver:", receiverId, "Don:", donId);

  if (!donorId || !receiverId || !donId) {
    return res.status(400).json({ message: "Champs manquants pour créer une conversation." });
  }

  try {
    // Convertir les IDs en ObjectId
    const donorObjectId = new mongoose.Types.ObjectId(donorId);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);
    const donObjectId = new mongoose.Types.ObjectId(donId);

    // Vérifie si une conversation existe déjà entre ces trois entités
    let existing = await Conversation.findOne({
      donorId: donorObjectId,
      receiverId: receiverObjectId,
      donId: donObjectId,
    });

    if (existing) {
      console.log("✅ Conversation déjà existante:", existing._id);
      return res.status(200).json(existing);
    }

    const newConv = new Conversation({
      donorId: donorObjectId,
      receiverId: receiverObjectId,
      donId: donObjectId,
      participants: [donorObjectId, receiverObjectId],
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
