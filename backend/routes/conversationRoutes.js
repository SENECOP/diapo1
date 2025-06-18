const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Conversation = require('../models/conversation');
const { initiateConversation } = require('../controllers/conversationApi');
const verifyToken = require('../middlewares/authMiddleware');

// Récupération des conversations d'un utilisateur
router.get("/conversations/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const conversations = await Conversation.find({
      participants: { $in: [mongoose.Types.ObjectId(userId)] },
    })
      .populate("envoye_par")
      .populate("recu_par")
      .populate("don_id");

    res.status(200).json(conversations); // Renvoie directement les objets complets
  } catch (err) {
    console.error("Erreur récupération conversations:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


// Création ou récupération d'une conversation unique entre donor, receiver et don
router.post('/conversations/initiate', verifyToken, initiateConversation);


// Récupération d'une conversation par son ID (utile pour affichage des messages)
router.get('/conversations/:id', verifyToken, async (req, res) => {
  const id = req.params.id;

  // Vérification que l'id est un ObjectId MongoDB valide
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID de conversation invalide' });
  }

  try {
    const conversation = await Conversation.findById(id)
      .populate('participants')
      .populate('don_id'); 

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
