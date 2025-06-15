// controllers/messageApi.js
const Message = require('../models/Message');

exports.createMessage = async (req, res) => {
  try {
    const { conversationId, texte, envoye_par, recu_par } = req.body;

    const newMessage = new Message({
      conversationId,
      texte,
      envoye_par,
      recu_par,
      envoye_le: Date.now(),
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'envoi du message" });
  }
};
