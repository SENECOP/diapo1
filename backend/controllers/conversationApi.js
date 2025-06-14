const express = require('express');
const router = express.Router();
const Conversation = require('../models/conversation.js');
const User = require('../models/User'); // pour récupérer pseudo/avatar

// GET /api/conversations/:userId
router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // Récupérer toutes les conversations où userId est participant
    const conversations = await Conversation.find({ participants: userId }).sort({ lastUpdated: -1 });

    // Pour chaque conversation, récupérer l'autre participant et le dernier message
    const result = await Promise.all(conversations.map(async (conv) => {
      // Trouver l'autre participant
      const otherUserId = conv.participants.find(id => id !== userId);
      const otherUser = await User.findById(otherUserId);

      return {
        _id: conv._id,
        pseudo: otherUser?.pseudo || 'Utilisateur inconnu',
        avatar: otherUser?.avatar || 'https://via.placeholder.com/50',
        dernierMessage: conv.messages.length > 0 ? conv.messages[conv.messages.length -1].text : "Aucun message",
        messageInitial: conv.messages[0]?.text || null,
      };
    }));

    res.json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

exports.initiateConversation = async (req, res) => {
  const { donorId, receiverId, donId } = req.body;

  try {
    // Vérifie si une conversation existe déjà
    let existingConversation = await Conversation.findOne({
      donorId,
      receiverId,
      donId
    });

    if (existingConversation) {
      return res.status(200).json(existingConversation);
    }

    // Sinon, crée une nouvelle conversation
    const newConversation = new Conversation({
      donorId,
      receiverId,
      donId,
      createdAt: new Date(),
      participants: [donorId, receiverId],
      messages: []
    });

    await newConversation.save();
    return res.status(201).json(newConversation);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erreur lors de l'initialisation de la conversation" });
  }
};

