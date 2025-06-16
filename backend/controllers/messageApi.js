const Message = require('../models/Message');
const Conversation = require('../models/conversation');

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

    // 🔄 Mettre à jour le dernier message dans la conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      dernierMessage: {
        contenu: texte,
        envoye_par,
        envoye_le: new Date(),
      },
    });

    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'envoi du message" });
  }
};


// ✅ AJOUTE CETTE FONCTION :
exports.getMessagesByConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId })
      .sort({ envoye_le: 1 }) // Optionnel : du plus ancien au plus récent
      .populate('envoye_par recu_par', 'pseudo avatar'); // Optionnel

    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors du chargement des messages" });
  }
};
