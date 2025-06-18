const express = require('express');
const router = express.Router();
const messageApi = require('../controllers/messageApi');
const verifyToken = require('../middlewares/authMiddleware')

// POST /api/messages → créer un message
router.post('/', verifyToken, messageApi.createMessage);
router.post('/send', verifyToken, messageApi.sendMessage);
// GET /api/messages/don/:donId → récupérer tous les messages d’un don
router.get('/conversation/:conversationId', messageApi.getMessagesByConversation);

module.exports = router;
