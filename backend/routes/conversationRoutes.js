const express = require('express');
const router = express.Router();
const Conversation = require('../models/conversation');
const { initiateConversation } = require('../controllers/conversationApi');
const verifyToken = require('../middlewares/authMiddleware');

// Récupération des conversations d'un utilisateur
router.get("/conversations/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const conversations = await Conversation.find({
      participants: { $in: [mongoose.Types.ObjectId(userId)] },
    })
      .populate("participants", "pseudo avatar")
      .populate("don_id", "description image");

    const formatted = conversations.map((conv) => {
      const otherUser = conv.participants.find(
        (p) => p._id.toString() !== userId
      );

      return {
        _id: conv._id,
        don_id: conv.don_id?._id,
        interlocuteur: otherUser?.pseudo,
        avatar: otherUser?.avatar,
        description: conv.don_id?.description,
        image: conv.don_id?.image,
      };
    });

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Erreur récupération conversations:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Création ou récupération d'une conversation unique entre donor, receiver et don
router.post('/conversations/initiate', verifyToken, initiateConversation);


// Récupération d'une conversation par son ID (utile pour affichage des messages)
router.get('/conversations/id/:id', verifyToken, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants', 'pseudo avatar')
      .populate('donId'); // Facultatif si tu veux les infos du don

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    res.status(200).json(conversation);
  } catch (err) {
    console.error("❌ Erreur récupération conversation par ID :", err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});


module.exports = router;
