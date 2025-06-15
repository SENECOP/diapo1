// controllers/messageController.js
const Message = require('../models/Message');

exports.getMessagesByConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId })
      .sort({ envoye_le: 1 })
      .populate("envoye_par recu_par");

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur lors du chargement des messages" });
  }
};
