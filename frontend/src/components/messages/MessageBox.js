import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { socket
  
 } from '../../socket';
export default function MessageBox() {
  const location = useLocation();
  const { user, messageInitial, don_id, currentUser } = location.state || {};

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!don_id) return;

    // 🔗 Connexion à la room spécifique au don
    socket.emit('joinRoom', don_id);

    // 🎧 Ecoute des messages entrants
    socket.on('receiveMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Nettoyage lors du démontage
    return () => {
      socket.off('receiveMessage');
    };
  }, [don_id]);

  const handleSendMessage = (contenu) => {
    if (!contenu || !currentUser || !user || !don_id) return;

    const messageData = {
      contenu,
      don_id,
      envoye_par: currentUser._id,
      recu_par: user._id,
    };

    // Envoyer le message via socket
    socket.emit('sendMessage', messageData);

    // Ajouter immédiatement le message localement
    setMessages((prev) => [...prev, { ...messageData, envoye_le: new Date() }]);
  };

  useEffect(() => {
  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/messages/${don_id}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Erreur lors du chargement des messages :", error);
    }
  };

  if (don_id) fetchMessages();
}, [don_id]);


  return (
    <div className="flex flex-col w-2/3 bg-white">
      {/* Header */}
      <div className="flex items-center gap-4 border-b p-4">
        <img
          src={user?.avatar || "https://via.placeholder.com/50"}
          alt=" "
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h3 className="font-semibold text-lg">{user?.pseudo || "Utilisateur"}</h3>
        </div>
      </div>

      {/* Zone des messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-2">
        {/* Message initial */}
        {messageInitial && (
          <div className="mb-2 flex justify-start">
            <div className="bg-gray-200 rounded-lg p-2 max-w-xs">
              <img
                src={messageInitial.image}
                alt="don"
                className="w-32 h-32 object-cover rounded mb-2"
              />
              <p className="text-sm">{messageInitial.description}</p>
            </div>
          </div>
        )}

        {/* Historique messages */}
        {messages.map((msg, index) => (
          <MessageBubble
            key={index}
            sender={msg.envoye_par === currentUser._id ? 'me' : 'other'}
            message={msg.contenu}
            time={msg.envoye_le}
          />
        ))}
      </div>

      {/* Boutons + input */}
      <div className="border-t bg-white p-4">
        <div className="flex gap-2 mb-2">
          <button
            className="px-3 py-1 bg-purple-100 text-sm rounded-full hover:bg-purple-200"
            onClick={() => handleSendMessage("Demain")}
          >
            Demain
          </button>
          <button
            className="px-3 py-1 bg-purple-100 text-sm rounded-full hover:bg-purple-200"
            onClick={() => handleSendMessage("Ce soir")}
          >
            Ce soir
          </button>
          <button
            className="px-3 py-1 bg-purple-100 text-sm rounded-full hover:bg-purple-200"
            onClick={() => handleSendMessage("Peut-être la semaine prochaine")}
          >
            Peut-être la semaine prochaine
          </button>
        </div>
        <MessageInput onSend={handleSendMessage} />
      </div>
    </div>
  );
}
