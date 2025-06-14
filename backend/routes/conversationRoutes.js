const express = require('express');
const router = express.Router();
const Conversation = require('../models/conversation');
const { initiateConversation } = require('../controllers/conversationApi');

router.get('/conversations/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const conversations = await Conversation.find({
      participants: userId
    })
    .populate('participants', 'pseudo avatar')
    .sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/initiate', initiateConversation);

module.exports = router;
