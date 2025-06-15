const express = require('express');
const router = express.Router();
const messageApi = require('../controllers/messageApi');

// POST /api/messages → créer un message
router.post('/', messageApi.createMessage);

// GET /api/messages/don/:donId → récupérer tous les messages d’un don
router.get('/conversation/:conversationId', messageApi.getMessagesByConversation);

module.exports = router;
