import React, { useEffect, useState } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { socket } from '../../socket';

export default function MessageBox({
  user,
  messageInitial,
  conversationId,
  currentUser,
}) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!conversationId) return;

    // Rejoindre la room
    socket.emit('joinRoom', conversationId);

    // Écouter les nouveaux messages
    const handleReceiveMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on('receiveMessage', handleReceiveMessage);

    // Nettoyage : quitter la room et retirer l'écouteur
    return () => {
      socket.emit('leaveRoom', conversationId);
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [conversationId]);

  const handleSendMessage = (contenu) => {
    if (!contenu || !currentUser || !user || !conversationId) return;

    const messageData = {
      contenu,
      don_id: conversationId,
      envoye_par: currentUser._id,
      recu_par: user._id,
    };

    socket.emit('sendMessage', messageData);

    // Ajout local immédiat
    setMessages((prev) => [...prev, { ...messageData, envoye_le: new Date() }]);
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `https://diapo-app.onrender.com/api/message/${conversationId}`
        );
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Erreur lors du chargement des messages :', error);
      }
    };

    if (conversationId) fetchMessages();
  }, [conversationId]);

  return (
    <div className="flex flex-col w-2/3 bg-white">
      {/* Header utilisateur */}
      <div className="flex items-center gap-4 border-b p-4">
        <img
          src={user?.avatar || 'https://via.placeholder.com/50'}
          alt="avatar"
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h3 className="font-semibold text-lg">{user?.pseudo || 'Utilisateur'}</h3>
        </div>
      </div>

      {/* Historique messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-2">
        {/* Message initial (image + description) */}
        {messageInitial && typeof messageInitial === 'object' && (
          <div className="mb-2 flex justify-start">
            <div className="bg-gray-200 rounded-lg p-2 max-w-xs">
              {messageInitial.image && (
                <img
                  src={messageInitial.image}
                  alt="don"
                  className="w-32 h-32 object-cover rounded mb-2"
                />
              )}
              <p className="text-sm">{messageInitial.description}</p>
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <MessageBubble
            key={index}
            sender={msg.envoye_par === currentUser._id ? 'me' : 'other'}
            message={msg.contenu}
            time={msg.envoye_le}
          />
        ))}
      </div>

      {/* Actions rapides + zone de saisie */}
      <div className="border-t bg-white p-4">
        <div className="flex gap-2 mb-2">
          {['Demain', 'Ce soir', 'Peut-être la semaine prochaine'].map((text) => (
            <button
              key={text}
              className="px-3 py-1 bg-purple-100 text-sm rounded-full hover:bg-purple-200"
              onClick={() => handleSendMessage(text)}
            >
              {text}
            </button>
          ))}
        </div>
        <MessageInput onSend={handleSendMessage} />
      </div>
    </div>
  );
}
