const express = require('express');
const router = express.Router();
const Conversation = require('../models/conversation');
const { initiateConversation } = require('../controllers/conversationApi');

// Récupération des conversations d'un utilisateur
router.get('/conversations/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'pseudo avatar')
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    console.error("❌ Erreur lors de la récupération des conversations :", err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Création ou récupération d'une conversation unique entre donor, receiver et don
router.post('/conversations/initiate', async (req, res, next) => {
  console.log("📩 POST /conversations/initiate avec :", req.body);
  next();
}, initiateConversation);

module.exports = router;
